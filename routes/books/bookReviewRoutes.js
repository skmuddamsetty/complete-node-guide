const express = require('express');
const bookReviewController = require('../../controllers/books/bookReviewController');
const authController = require('../../controllers/authController');

// mergeParams are needed because the params are coming from other router
// for example for nested routes, the params are coming from tourRouter, ex: /:tourId
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  // GET /:bookId/reviews
  .get(bookReviewController.getAllReviews)
  // POST /:bookId/reviews
  .post(
    authController.restrictTo('user'),
    bookReviewController.setBookUserIds,
    bookReviewController.createReview
  );

router
  .route('/:id')
  .get(bookReviewController.getReview)
  .get(bookReviewController.getSingleReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    bookReviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    bookReviewController.updateReview
  );

module.exports = router;
