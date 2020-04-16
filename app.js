const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const bookRouter = require('./routes/bookRoutes');

const app = express();

// GLOBAL MIDDLEWARES

// SET HTTP Headers
// https://github.com/helmetjs/helmet
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') {
  // middleware to log the type of request to console
  app.use(morgan('dev'));
}

// Limit request from same IP
const limiter = rateLimit({
  // means 100 request from the same IP in one hour
  max: 100,
  windowM: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour.',
});
// added /api to make sure we are applying the limiter to the routes starting with /api
app.use('/api', limiter);

// this is bodyParser middleware --> data from body is added to the request object with this step
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against NOSQL Query injection and also data sanitization against XSS
app.use(mongoSanitize());
// below line will clean any malicious code from input html
app.use(xss());

// serving static files using express
app.use(express.static(`${__dirname}/public`));

// creating our own middleware
app.use((req, res, next) => {
  console.log(`Hello From MiddleWare! 🖖`);
  next();
});

// another middleware
app.use((req, res, next) => {
  console.log(`Hello From requestTime MiddleWare! 🖖`);
  req.requestTime = new Date().toISOString();
  // to get the headers
  // console.log(req.headers);
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/books', bookRouter);

// handle invalid routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `${req.originalUrl} Not Found .Invalid URL!`,
  // });
  // const err = new Error(`${req.originalUrl} Not Found .Invalid URL!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // // if the next function receives an argument then the express will automatically call the global error handling middleware
  // next(err);

  // using the AppError Class to prepare the error object
  next(new AppError(`${req.originalUrl} Not Found .Invalid URL!`));
});

// Global Error Handling Middleware
// by adding 4 parameters express knows that this is the error handling middleware
app.use(globalErrorHandler);

module.exports = app;
