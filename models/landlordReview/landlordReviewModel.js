const mongoose = require('mongoose');

const landlordReviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty'],
    },
    landlord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Landlord',
        required: [true, 'Review must belong to a Landlord']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must come from a user'],
    },
    },{
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
});
 landlordReviewSchema.index({ landlord: 1, user: 1 }, { unique: true });
 landlordReviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name'
    });
    next();
});
 landlordReviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    // console.log(this.r);
    next();
});

const LandlordReview = mongoose.model('LandlordReview', landlordReviewSchema);

module.exports = LandlordReview;
