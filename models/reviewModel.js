const mongoose = require('mongoose');

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
// creating Model from Schema
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
