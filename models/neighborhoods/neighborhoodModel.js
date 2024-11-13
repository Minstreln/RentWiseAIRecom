const mongoose = require('mongoose');

const neighborhoodSchema = new mongoose.Schema({
   name: {
        type: String,
        required: [true, 'Name is required'],
   },
   safety_rating: {
        type: Number,
        required: [true, 'Safety rating is required'],
   },
   amenities: {
        type: [String],
        required: [true, 'Amenities is required'],
   },
   crime_rate: {
        type: Number,
        required: [true, 'crime rate is required'],
   },
   walkability_score: {
        type: Number,
        required: [true, 'walkability score is required'],
   },
   average_rent: {
        type: Number,
        required: [true, 'average rent is required'],
   }
});

const Neighborhood = mongoose.model('Neighborhood', neighborhoodSchema);

module.exports = Neighborhood;
