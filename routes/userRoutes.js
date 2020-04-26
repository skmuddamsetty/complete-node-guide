const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// below line will make sure it runs before any of the below endpoints trigger
// Note: as this is middleware this comes in sequence which means this is not applicable for the routes above this line. for ex: /signup. /login,/ forgotPassword, /resetPassword/:token
// instead of adding it in every below route we add this one line and it is activated on every route in this file after this line
//
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);

router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

// all the below routes are not only protected but also restricted to admin because of the above middleware line
router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
