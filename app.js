const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const globalErrorHandler = require('./controllers/errorHandler/errorController');

// ---------------- route modules go here -------------------------------------
const userRouter = require('./routes/users/userRoutes');
const recommendationRouter = require('./routes/recommendation/recommendationRoutes');
// ---------------------------------------------------------------------------

const app = express();

app.use(cors())

app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.set('trust proxy', 1);

app.use(express.static(`${__dirname}/public}`));

app.use(express.json());

const limiter = rateLimit({
  max: 30,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

//-------------- Routes should go here ---------------------------

// user login endpoint
app.use('/api/users', userRouter);
// recommendation route
app.use('/api', recommendationRouter);

//----------------------------------------------------------------

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server 🚨!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
