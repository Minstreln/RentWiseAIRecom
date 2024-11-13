const express = require('express');
const userController = require('../../controllers/users/userController');

const Router = express.Router();

// user login endpoint
Router.post('/signin', userController.userLogin);

module.exports = Router;
