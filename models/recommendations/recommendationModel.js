const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'recommendation must belong to a user'],
    },
    property_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'recommendation must be about a property'],
    },
    score: {
        type: Number,
        required: [true, 'score is required'],
    },
    date_recommended: {
        type: Date,
        default: Date.now,
    }
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;
