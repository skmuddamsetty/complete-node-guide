const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

// defining schema using mongoose
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour name cannot have more than 40 characters'],
      minlength: [10, 'A tour name must have minimum of 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty should be either easy or medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A tour must have a rating of above 1.0'],
      max: [5, 'A tour must have a rating below or equal to 5'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this keyword points to the new document that is being created
          // this validator is not going to work on update
          return val < this.price;
        },
        message: 'Discount Price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A Tour must have a summary'],
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have an imageCover'],
    },
    images: [String],
    // select: false will not select that field in the result set
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    price: { type: Number, required: [true, 'A tour must have a price'] },
    secretTour: { type: Boolean, default: false },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: {
          values: ['Point'],
          message: 'startLocation should be Point',
        },
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    // creates embedded datasets
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    /* this can be used when embedding the data i.e. for embedding user data into the tour using the pre save document middleware present below
    guides: Array */
    // below is used for child referencing
    // using ref we are establishing data set between tour and user
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  { toJSON: { virtuals: true } }
);

/********************Virtual Properties Start***********************/
// this will be created each time we get the data out of the database
tourSchema.virtual('durationWeeks').get(function () {
  return Math.ceil(this.duration / 7);
});
/********************Virtual Properties End***********************/

/********************Document Middlewares Start***********************/
// pre is gonna run before an actual event i.e. runs before only on .save() and .create()
// the function inside pre is called before a document is saved to the database
// pre save hook
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// populating the guides array with user objects using pre save hook
// only works for creating new documents
// in other words this is embedding. i.e. we are embedding user data into tour data
// Commented the below code because embedding the user data is not ideal as user data may change frequently, so we have to go for referencing
/*
tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});
*/

// post save hook
// tourSchema.post('save', function (doc, next) {
//   next();
// });
/********************Document Middlewares End***********************/

/********************Query Middleware Start***********************/
// this keyword will point at current query but not current document
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});
/********************Query Middleware End***********************/

/********************Aggregation Middleware Start***********************/
// this points to the current aggregation object
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
/********************Aggregation Middleware End***********************/

// creating Model from Schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
