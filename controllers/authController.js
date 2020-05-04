const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get the token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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

const cookieOptions = {
  expiresIn:
    new Date(Date.now()) +
    process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  // this will make the cookie that the browser cannot modify the cookie
  httpOnly: true,
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  if (process.env.NODE_ENV === 'production') {
    // the cookie will be sent only in an encrypted connection by using secure: true
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  // added the below line to make sure that the password is not visible in the result set
  user.password = undefined;
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);
  createAndSendToken(newUser, 201, res);
  // const token = signToken(newUser._id);
  // res.status(201).json({ status: 'success', token, data: { user: newUser } });
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
  createAndSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({ status: 'success', token });
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
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with your new password and password confirm to ${resetURL}.\n If you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your Password Reset Token Valid for 10 mins`,
      message,
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending email. Please try again later',
        500
      )
    );
  }

  res.status(200).json({ status: 'success', message: 'Token sent to email' });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get User based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token not expired , and there is a user, set the new Password
  if (!user) {
    return next(new AppError('Your token has invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // 3) Update passwordChangedAt property for the user --> this is done in the userModel pre save hook
  await user.save();
  // 4) Log the user in --> send the jsonwebtoken
  // const token = signToken(user._id);
  // res.status(200).json({ status: 'success', token });
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) We need to get the user from the collection
  // 2) check if posted current password is correct
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  // 3) If so, update the password // password hashing will be taken care by pre save hook on user model
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) Log the user in, send JWT
  createAndSendToken(user, 200, res);
});
