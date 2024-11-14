const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../../utils/appError');
const User = require('../../models/users/userModel');
const catchAsync = require('../../utils/catchAsync');

// jwt authentication logic
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "jwtaccesskey", {
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  });

const createSendToken = (user, statusCode, res, jsonResponse) => {
  const token = signToken(user._id);


  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN || 90, 10) * 24 * 60 * 60 * 1000
    ),    
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    ...jsonResponse,
    token,
    data: {
      user,
    },
  });
};

/// user login logic
exports.userLogin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    const message = `Welcome back ${user.name}`;

    createSendToken(user, 200, res, {
        status: 'success',
        message
    });
})  

// user protect middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Please log in to get access', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || "jwtaccesskey");

  let currentUser;

  currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('The token does not exist!', 401));
  }

  req.user = currentUser;
  next();
});

// user isLoggedIn middleware
exports.isLoggedIn = async (req, res, next) => {
  req.locals = req.locals || {};

  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      req.locals.user = currentUser;
      next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// user restrict to middleware
exports.restrictTo =
(...roles) =>
(req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to perform this action'),
      403
    );
  }
  next();
};
