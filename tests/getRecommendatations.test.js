const mongoose = require('mongoose');
const { getRecommendations } = require('../controllers/recommendation/recommendationController');
const Property = require('../models/properties/propertyModel'); 

jest.mock('../models/properties/propertyModel'); 
describe('getRecommendations', () => {

  // first test case should return a list of properties based on the aggregaton pipelines
  it('should return a list of properties based on the aggregation pipeline', async () => {
    const mockRecommendation = [{
      _id: mongoose.Types.ObjectId(),
      address: '123 Test Street',
      type: 'Apartment',
      size: '1000 sqft',
      bedrooms: 2,
      bathrooms: 1,
      monthly_rent: 1500,
      amenities: ['Wi-Fi', 'Parking'],
      location: 'Test Location',
      landlord_id: mongoose.Types.ObjectId(),
      landlord_rating: 4.5,
      sustainability_score: 8.7,
      neighborhood_safety: 9.0,
      neighborhood_crime_rate: 2,
      virtualTourLink: "https://placeholder.com/virtual-tour"
    }];
    
    Property.aggregate.mockResolvedValue(mockRecommendation); 

    const maxAffordableRent = 1600;
    const preferredLocations = ['Test Location'];
    const propertyType = ['Apartment'];
    const minBedrooms = 2;

    const recommendations = await getRecommendations(maxAffordableRent, preferredLocations, propertyType, minBedrooms);

    expect(Property.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        $match: {
          monthly_rent: { $lte: maxAffordableRent },
          location: { $in: preferredLocations },
          type: { $in: propertyType },
          bedrooms: { $gte: minBedrooms }
        }
      })
    ]));

    expect(recommendations).toEqual(mockRecommendation);
    expect(recommendations.length).toBe(1);
    expect(recommendations[0]).toHaveProperty('address', '123 Test Street');
    expect(recommendations[0]).toHaveProperty('monthly_rent', 1500);
    expect(recommendations[0]).toHaveProperty('landlord_rating', 4.5);
    expect(recommendations[0]).toHaveProperty('neighborhood_safety', 9.0);
  });

  // second test case should return an empty array when no properties are matches
  it('should return an empty array when no properties match', async () => {
    Property.aggregate.mockResolvedValue([]);

    const maxAffordableRent = 1600;
    const preferredLocations = ['Non-existent Location'];
    const propertyType = ['House'];
    const minBedrooms = 3;

    const recommendations = await getRecommendations(maxAffordableRent, preferredLocations, propertyType, minBedrooms);

    expect(recommendations).toEqual([]);
  });
});
