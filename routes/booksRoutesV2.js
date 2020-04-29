const express = require('express');
const bookController = require('../controllers/bookController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(bookController.getAllBooksV2)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    bookController.createBookV2
  );

router
  .route('/:id')
  .get(bookController.getBookV2)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    bookController.updateBookV2
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    bookController.deleteBookV2
  );

module.exports = router;
