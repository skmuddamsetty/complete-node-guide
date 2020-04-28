const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const handler = require('./handlerFactory');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) get tour data from our collection
  const tours = await Tour.find();
  console.log(tours);
  // 2) build template
  // 3) render that template using the tours data
  res.status(200).render('overview', { title: 'All Tours', tours });
});

exports.getTour = (req, res) => {
  res.status(200).render('tour', { title: 'The Forest Hiker' });
};
