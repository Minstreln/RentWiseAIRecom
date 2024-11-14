const express = require('express');
const userController = require('../../controllers/users/userController');
const recommendationController = require('../../controllers/recommendation/recommendationController');

const Router = express.Router();

// recommendation endpoint, full endpoint: api/recommendations
Router.post('/recommendations',
    userController.protect,
    userController.restrictTo('Tenant'),
    recommendationController.recommendations
);

module.exports = Router;
