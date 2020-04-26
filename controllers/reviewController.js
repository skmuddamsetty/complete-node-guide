const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.createReview = catchAsync(async (req, res) => {
  // added to allow nested routes
  // so user can either specify these in the body or in the url
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  // added to allow nested routes
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  const review = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.getSingleReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.getAllReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});
