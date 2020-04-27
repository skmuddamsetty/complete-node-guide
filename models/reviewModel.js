const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: { type: Date, default: Date.now },
    // parent referencing user and tour documents
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  // below lines needs to be present so that the virtual properties can be displayed in the output
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/********************Indexes Start***********************/
// creating compound index for user and tour and with the options we are saying that the combination should be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
/********************Indexes End***********************/
/********************Query Middleware Start***********************/
// using pre query middleware to populate the guides array with user data from users collection
reviewSchema.pre(/^find/, function (next) {
  // commented below part as it is creating a chain of populates
  // and it makes sense to not populate the review with tour data
  // therefore commenting the populate for tour
  // this.populate({
  //   path: 'user',
  //   select: 'name photo',
  // }).populate({
  //   path: 'tour',
  //   select: 'name difficulty price',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
/********************Query Middleware End***********************/
/********************Static methods Start***********************/
// We created static method here because we needed to call aggregate method and aggregate method is only available on Models
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // this keyword points to the current model i.e Review
  // aggregate returns a promise so we need to await that and then store it into variable called stats
  const stats = await this.aggregate([
    // for getting all the reviews that match the tourId that is passed in
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        // grouping all the tours together by tourId
        _id: '$tour',
        // adding one to every document that has been matched
        nRating: { $sum: 1 },
        // calculating the avg
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // persisting results to Tour Document
  if (stats && stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
/********************Static methods End***********************/
/********************Document Middleware Start***********************/
reviewSchema.post('save', function () {
  // this keywords points to current review document
  // Here we have to call the static method that we have cerated above and to call that we need Model and Model Variable Review is not available at this point as it is declared below this line and we cannot move this line to after creating the Review Variable, because if we move it, the document middlewares will not run.
  // here we are calling the function using constructor because Review object is not declared up untill this point
  this.constructor.calcAverageRatings(this.tour);
});
/********************Document Middleware End***********************/
/********************Query Middleware Start***********************/
// adding this query middleware so that we can update the average and ratings on tour document when the review is edited or deleted
// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // this keyword points to current Query
  // executing findOne to get the current review from database and assigning to the r variable in this document
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // here we cannot do this.findOne() because query is already executed in pre and is not available to perform this actions.
  // VERY IMP this keyword points to current document and not Query, because in post query middleware we will not have the handle of the query as the query has already been executed
  // this.r is points to the current document and coming from the pre query middlware up above
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
/********************Query Middleware End***********************/
// creating Model from Schema
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
