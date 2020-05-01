const mongoose = require('mongoose');
const BookAuthor = require('./bookAuthorModel');

// defining schema using mongoose
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a name for book!'],
  },
  publisher: {
    type: String,
    required: [true, 'Please provide a publisher for book!'],
  },
  noOfPages: {
    type: Number,
    required: [true, 'A book must have noOfPages'],
  },
  difficulty: {
    type: String,
    required: [true, 'A Book must have difficulty'],
  },
  avgRating: {
    type: Number,
    default: 4.5,
  },
  numberOfRatings: { type: Number, default: 0 },
  description: {
    type: String,
    trim: true,
    required: [true, 'A Book must have a summary'],
  },
  imageCover: {
    type: String,
    required: [true, 'A Book must have an imageCover'],
  },
  images: [String],
  authors: [String],
  createdAt: { type: Date, default: Date.now() },
  publishedDates: [Date],
  price: { type: Number, required: [true, 'A book must have a price'] },
});

/********************Document Middlewares Start***********************/
// Saving to BookAuthor
bookSchema.pre('save', async function (next) {
  const bookAuthorsPromises = this.authors.map(
    async (id) => await BookAuthor.create({ book: this._id, author: id })
  );
  await Promise.all(bookAuthorsPromises);
  next();
});
/********************Document Middlewares End***********************/
// creating Model from Schema
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
