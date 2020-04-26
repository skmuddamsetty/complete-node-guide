const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

// With Handler
exports.getAllUsers = factory.getAll(User);

// Without Handler
// exports.getAllUsers = catchAsync(async (req, res) => {
//   const users = await User.find();
//   res.status(200).json({ status: 'success', data: { users } });
// });

// With Handler
exports.getUser = factory.getOne(User);

// Wihout Handler
// exports.getUser = catchAsync(async (req, res) => {
//   const user = await User.findById(req.params.id);
//   return res.status(200).json({
//     status: 'success',
//     data: {
//       user,
//     },
//   });
// });

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'success', data: null });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update. Please use /updateMyPassword',
        400
      )
    );
  }
  // 2) update user document
  // filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  // Note: all Save middlewares are not run with findByIdAndUpdate
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: 'success', data: { user } });
});

// only for admins
exports.deleteUser = factory.deleteOne(User);
// DO NOT UPDATE passwords with this one because all the pre save middlewares are not run
exports.updateUser = factory.updateOne(User);
