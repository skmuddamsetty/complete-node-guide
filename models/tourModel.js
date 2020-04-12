const mongoose = require('mongoose');
const slugify = require('slugify');

// defining schema using mongoose
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
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
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: { type: Number, default: 0 },
    priceDiscount: Number,
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
  },
  { toJSON: { virtuals: true } }
);

// virtual properties
// this will be created each time we get the data out of the database
tourSchema.virtual('durationWeeks').get(function () {
  return Math.ceil(this.duration / 7);
});

// Document Middlewares
// pre is gonna run before an actual event i.e. runs before only on .save() and .create()
// the function inside pre is called before a document is saved to the database
// pre save hook
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// post save hook
// tourSchema.post('save', function (doc, next) {
//   next();
// });

// QUERY Middleware
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

// Aggregation Middleware
// this points to the current aggregation object
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
// creating Model from Schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
