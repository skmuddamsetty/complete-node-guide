const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // added to allow nested routes
  // so user can either specify these in the body or in the url
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  // added to allow nested routes
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};

// With Handler
exports.createReview = factory.createOne(Review);

// Without Handler
// exports.createReview = catchAsync(async (req, res) => {
//   const review = await Review.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });

exports.getSingleReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// With Handler
exports.getAllReviews = factory.getAll(Review);

// Without Handler
// exports.getAllReviews = catchAsync(async (req, res) => {
//   // moved the below logic to handler function in getAll method
//   // let filter = {};
//   // if (req.params.tourId) {
//   //   filter = { tour: req.params.tourId };
//   // }
//   const reviews = await Review.find(filter);
//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
