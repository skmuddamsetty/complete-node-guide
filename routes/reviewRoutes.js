const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// mergeParams are needed because the params are coming from other router
// for example for nested routes, the params are coming from tourRouter, ex: /:tourId
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  // GET /:tourId/reviews
  .get(reviewController.getAllReviews)
  // POST /:tourId/reviews
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .get(reviewController.getSingleReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
