// const fs = require('fs');
const Tour = require('../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next) => {
//   console.log(`${req.params.id} is the id from checkID param middleware 🖖`);
//   const id = req.params.id * 1;
//   if (id > tours.length) {
//     return res.status(404).json({ status: 'fail', message: 'Invalid id' });
//   }
//   next();
// };

// create a checkBody middleware
// check if body contains name and price property
// exports.checkBody = (req, res, next) => {
//   console.log(`Hello from checkBody param middleware 🖖`);
//   if (!req.body.price || !req.body.name) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Bad Request! Please send name and price.',
//     });
//   }
//   next();
// };

exports.createTour = async (req, res) => {
  try {
    // using the Tour model to create the document
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Updated Tour Here!',
    },
  });
};

exports.deleteTour = (req, res) => {
  // 204 - No Content
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
