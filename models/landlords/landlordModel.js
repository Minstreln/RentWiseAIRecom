const mongoose = require('mongoose');

const landlordSchema = new mongoose.Schema({
    landlord_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'landlord ID details is required'],
    },
    profile_details: {
        type: [String],
        required: [true, 'landlord profile details is required'],
    },
    rating: {
        type: Number,
        required: [true, 'rating is required'],
    },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// virtual populate
landlordSchema.virtual('reviews', {
    ref: 'LandlordReview',
    foreignField: 'landlord',
    localField: '_id',
});

const Landlord = mongoose.model('Landlord', landlordSchema);

module.exports = Landlord;
