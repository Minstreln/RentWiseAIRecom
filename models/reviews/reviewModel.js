const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: [true, 'Comment cannot be empty'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    property_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Review and rating must belong to a property']
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review and rating must come from a user'],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    },{
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
});

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name'
    });
    next();
});
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
