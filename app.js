const express = require('express');
const morgan = require('morgan');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const bookRouter = require('./routes/bookRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  // middleware to log the type of request to console
  app.use(morgan('dev'));
}

// this is middleware --> data from body is added to the request object with this step
app.use(express.json());

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
  console.log(req.headers);
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
