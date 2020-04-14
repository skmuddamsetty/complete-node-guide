const express = require('express');
const tourContoller = require('../controllers/tourController');
const authContoller = require('../controllers/authController');

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
  .get(authContoller.protect, tourContoller.getAllTours)
  // .post(tourContoller.checkBody, tourContoller.createTour);
  .post(tourContoller.createTour);

router
  .route('/:id')
  .get(tourContoller.getTour)
  .patch(tourContoller.updateTour)
  .delete(
    authContoller.protect,
    authContoller.restrictTo('admin', 'lead-guide'),
    tourContoller.deleteTour
  );

module.exports = router;
