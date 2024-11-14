const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const ss = require('simple-statistics');
const { body, validationResult } = require('express-validator');
const Property = require('../../models/properties/propertyModel');
const Recommendation = require('../../models/recommendations/recommendationModel');

// weights for recommendation scores
const weights = {
    affordability: 0.3,
    location: 0.2,
    landlord_rating: 0.1,
    sustainability: 0.2,
    safety: 0.2
};

// Validation rules for user inputs
const validateRequest = async (req) => {
    await Promise.all([
        body('household_income')
            .isFloat({ gt: 0 }).withMessage('Household income must be a positive number.')
            .run(req),

        body('preferred_locations')
            .isArray().withMessage('Preferred locations must be an array.')
            .bail()
            .custom(locations => locations.length > 0).withMessage('Preferred locations must be a non-empty array.')
            .bail()
            .custom(locations => {
                if (!locations.every(loc => typeof loc === 'string')) {
                    throw new Error('Each location must be a string.');
                }
                return true;
            })
            .bail()
            .customSanitizer(locations => {
                return locations.map(loc => loc.trim().toLowerCase().replace(/</g, "&lt;").replace(/>/g, "&gt;"));
            })
            .run(req),
               
        body('property_type')
            .optional()
            .isArray().withMessage('Property type must be an array.')
            .custom(types => types.every(type => typeof type === 'string'))
            .withMessage('Each property type must be a string.')
            .customSanitizer(types => types.map(type => type.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")))
            .run(req),
        body('min_bedrooms')
            .optional()
            .isInt({ min: 1 }).withMessage('Minimum bedrooms must be a positive integer.')
            .run(req),
        body('max_rent')
            .optional()
            .isFloat({ gt: 0 }).withMessage('Max rent must be a positive number.')
            .run(req)
    ]);
};
exports.validateRequest = validateRequest;


// calculates 1/3 of the household_income or take max_rent
const calculateMaxAffordableRent = (household_income, max_rent) => {
    if (household_income < 0 || max_rent < 0) {
      throw new AppError('household_income and max_rent must be non-negative');
    }
    return max_rent ? Math.min(max_rent, household_income / 3) : household_income / 3;
};  
exports.calculateMaxAffordableRent = calculateMaxAffordableRent;



// aggregation pipeline for getting recommendations
const getRecommendations = async (maxAffordableRent, preferred_locations, property_type, min_bedrooms) => {
    return await Property.aggregate([
        {
            $match: {
                monthly_rent: { $lte: maxAffordableRent },
                location: { $in: preferred_locations },
                ...(property_type && { type: { $in: property_type } }),
                ...(min_bedrooms && { bedrooms: { $gte: min_bedrooms } })
            }
        },
        {
            $lookup: {
                from: 'landlords',
                localField: 'landlord_id',
                foreignField: 'landlord_id',
                as: 'landlord'
            }
        },
        { $unwind: { path: '$landlord' } },
        {
            $lookup: {
                from: 'neighborhoods',
                localField: 'location',
                foreignField: 'name',
                as: 'neighborhood'
            }
        },
        { $unwind: { path: '$neighborhood' } },
        {
            $group: {
                _id: "$_id",
                address: { $first: "$address" },
                type: { $first: "$type" },
                size: { $first: "$size" },
                bedrooms: { $first: "$bedrooms" },
                bathrooms: { $first: "$bathrooms" },
                monthly_rent: { $first: "$monthly_rent" },
                amenities: { $first: "$amenities" },
                location: { $first: "$location" },
                landlord_id: { $first: "$landlord_id" },
                landlord_rating: { $first: "$landlord.rating" },
                sustainability_score: { $first: "$sustainability_score" },
                neighborhood_safety: { $first: "$neighborhood.safety_rating" },
                neighborhood_crime_rate: { $first: "$neighborhood.crime_rate" },
                virtualTourLink: { $first: "https://placeholder.com/virtual-tour" }
            }
        },
        {
            $sort: {
                sustainability_score: -1,
                landlord_rating: -1,
                neighborhood_safety: -1
            }
        }
    ]);
};
exports.getRecommendations = getRecommendations;


// calculate recommendation score
const calculateScore = (property, maxAffordableRent, preferred_locations) => {
    const scores = [
        property.monthly_rent <= maxAffordableRent ? 1 : 1 - (property.monthly_rent / maxAffordableRent),
        preferred_locations.includes(property.location.toLowerCase()) ? 1 : 0,
        property.landlord_rating || 0,
        property.sustainability_score || 0,
        property.neighborhood_safety || 0
    ];

    const weightedScores = scores.map((score, index) => score * Object.values(weights)[index]);
    return ss.mean(weightedScores);
};
exports.calculateScore = calculateScore;


// Get recommendations and save to database
exports.recommendations = catchAsync(async (req, res) => {
    const userId = req.user.id;
    await validateRequest(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { household_income, preferred_locations, property_type, min_bedrooms, max_rent } = req.body;
    const maxAffordableRent = calculateMaxAffordableRent(household_income, max_rent);
    const recommendations = await getRecommendations(maxAffordableRent, preferred_locations, property_type, min_bedrooms);

    const savedRecommendations = await Promise.all(recommendations.map(async (property) => {
        const score = calculateScore(property, maxAffordableRent, preferred_locations);
        return await Recommendation.create({
            user_id: userId,
            property_id: property._id,
            score
        });
    }));

    res.status(200).json({
        status: 'success',
        results: recommendations.length,
        user_id: userId,
        recommendations,
    });
});
