const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
