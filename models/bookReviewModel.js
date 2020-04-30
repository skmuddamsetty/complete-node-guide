const mongoose = require('mongoose');

const bookReviewSchema = new mongoose.Schema(
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
    book: {
      type: mongoose.Schema.ObjectId,
      ref: 'Book',
      required: [true, 'Review must belong to a book.'],
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
bookReviewSchema.index({ book: 1, user: 1 }, { unique: true });
/********************Indexes End***********************/
/********************Query Middleware Start***********************/
// using pre query middleware to populate the authors array with author data from users collection
bookReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
/********************Query Middleware End***********************/
/********************Static methods Start***********************/
/********************Static methods End***********************/
/********************Document Middleware Start***********************/
/********************Document Middleware End***********************/
/********************Query Middleware Start***********************/
/********************Query Middleware End***********************/
// creating Model from Schema
const BookReview = mongoose.model('BookReview', bookReviewSchema);

module.exports = BookReview;
