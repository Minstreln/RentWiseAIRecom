const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    address: {
        type: String,
        required: [true, 'The address is required'],
    },
    type: {
        type: String,
        required: [true, 'The type is required'],
    },
    size: {
        type: Number,
        required: [true, 'The size is required'],
    },
    bedrooms: {
        type: Number,
        required: [true, 'The bedrooms is required'],
    },
    bathrooms: {
        type: Number,
        required: [true, 'The bathrooms is required'],
    },
    monthly_rent: {
        type: Number,
        required: [true, 'The monthly is required'],
    },
    amenities: {
        type: [String],
        required: [true, 'The amenities is required'],
    },
    location: {
        type: String,
        required: [true, 'The location is required'],
    },
    sustainability_score: {
        type: Number,
        required: [true, 'The sustainability score is required'],
    },
    landlord_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'property must belong to a landlord'],
    },
    availability_status: {
        type: String,
        enum: ['Available', 'Rented', 'Under Maintenance'],
        required: [true, 'availability status must be filled'],
    }
});

// virtual populate
propertySchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'property_id',
    localField: '_id',
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
