const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// mergeParams are needed because the params are coming from other router
// for example for nested routes, the params are coming from tourRouter, ex: /:tourId
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

router.route('/:id').get(reviewController.getSingleReview);
module.exports = router;
