const express = require('express');
const tourContoller = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// param middleware and is only going to work on the tourRoutes and only when there is id in the params
// router.param('id', tourContoller.checkID);

router
  .route('/top-5-cheap')
  .get(tourContoller.aliasTopTours, tourContoller.getAllTours);

router.route('/tour-stats').get(tourContoller.getTourStats);

router.route('/monthly-plan/:year').get(tourContoller.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourContoller.getAllTours)
  // .post(tourContoller.checkBody, tourContoller.createTour);
  .post(tourContoller.createTour);

router
  .route('/:id')
  .get(tourContoller.getTour)
  .patch(tourContoller.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourContoller.deleteTour
  );

// Implementing Nested Routes
// POST /tour/awdnbng23/reviews
router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );
module.exports = router;
