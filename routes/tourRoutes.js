const express = require('express');
const tourContoller = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// param middleware and is only going to work on the tourRoutes and only when there is id in the params
// router.param('id', tourContoller.checkID);

// Implementing Nested Routes
// POST /tour/awdnbng23/reviews
// commenting because this is not the right place to implement the nested routes and to avoid code duplication
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

// added the below line to overcome the above problem
// mounting the reviewRouter
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourContoller.aliasTopTours, tourContoller.getAllTours);

router.route('/tour-stats').get(tourContoller.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourContoller.getMonthlyPlan
  );

router
  .route('/')
  .get(tourContoller.getAllTours)
  // .post(tourContoller.checkBody, tourContoller.createTour);
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourContoller.createTour
  );

router
  .route('/:id')
  .get(tourContoller.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourContoller.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourContoller.deleteTour
  );

module.exports = router;
