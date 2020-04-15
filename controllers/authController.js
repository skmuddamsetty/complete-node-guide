const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get the token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  // 2) validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if the user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token does not exist', 401)
    );
  }
  // 4) check if user changed the password after issuing the JWT
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently has changed the password. Please log in again',
        401
      )
    );
  }
  // 5) GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = freshUser;
  next();
});

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);
  const token = signToken(newUser._id);
  res.status(201).json({ status: 'success', token, data: { user: newUser } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if Email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide Email and Password'), 400);
  }
  // 2) Check if user exists and password is correct
  // explicitly selecting password because, we have made the password field select as false in the User Model, therefore find will not pickup password.
  // therefore we have to explicitly select the password here
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or Password is Incorrect!', 401));
  }
  // 3) If everthing okay, send token to the client
  const token = signToken(user._id);
  res.status(200).json({ status: 'success', token });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // ...roles  ['admin','lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // 1) Check if Email and password exist
  if (!email) {
    return next(new AppError('Please provide Email Address', 400));
  }
  //2)  get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No User exists with this user id!', 404));
  }
  // 3) and generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 4) Send it to User's email
});
exports.resetPassword = (req, res, next) => {};
