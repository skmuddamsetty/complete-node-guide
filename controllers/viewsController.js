const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
// const handler = require('./handlerFactory');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) get tour data from our collection
  const tours = await Tour.find();
  console.log(tours);
  // 2) build template
  // 3) render that template using the tours data
  res.status(200).render('overview', { title: 'All Tours', tours });
});

exports.getTour = catchAsync(async (req, res) => {
  // 1) Get the data for the requested data (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });
  // 2) Build a Template
  // 3) Render Template Using Data from Step 1
  res.status(200).render('tour', { tour });
});
