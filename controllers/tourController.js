// const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

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

exports.aliasTopTours = (req, res, next) => {
  console.log('Executing aliasTopTours MiddleWare 🖖');
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

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

exports.getAllTours = async (req, res) => {
  try {
    // using the filter object of mongodb to build the Query
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((field) => delete queryObj[field]);

    // // 2) ADVANCED FILTERING // {difficulty:'easy', duration:{$gte:5}}
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // let query = Tour.find(JSON.parse(queryStr));

    // // 3) SORTING
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }

    // // 4) LIMIT FIELDS
    // if (req.query.fields) {
    //   const projectedFields = req.query.fields.split(',').join(' ');
    //   query = query.select(projectedFields);
    // } else {
    //   query = query.select('-__v');
    // }

    // // 5) PAGINATION
    // // 1-10 --> Page 1, 11-20 --> Page 2
    // // mongodb query --> page=2&limit=10
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);

    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();

    const tours = await features.query;

    // another way of writing the query
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById({ _id: req.params.id });
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.updateTour = async (req, res) => {
  try {
    // {new: true will send the updated document to the client}
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findOneAndDelete(req.params.id);
    // 204 - No Content
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

// Aggregation pipeline Start
// https://docs.mongodb.com/manual/
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { avgPrice: 1 } },
    ]);
    res.status(200).json({ stats: 'success', data: { stats } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

// unwinding
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } },
      { $sort: { numTourStarts: -1 } },
      { $limit: 12 },
    ]);
    res.status(200).json({ stats: 'success', data: { plan } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};
// Aggregation pipeline End
