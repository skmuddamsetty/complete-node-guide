const express = require('express');
const morgan = require('morgan');

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
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/books', bookRouter);
module.exports = app;
