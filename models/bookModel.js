const mongoose = require('mongoose');

// defining schema using mongoose
const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A book must have a name'],
    unique: true,
  },
  publisher: {
    type: String,
    required: [true, 'A book must have a publisher'],
  },
  noOfPages: {
    type: Number,
    required: [true, 'A book must have noOfPages'],
  },
  difficulty: {
    type: String,
    required: [true, 'A Book must have difficulty'],
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
    required: [true, 'A Book must have a summary'],
  },
  description: { type: String, trim: true },
  imageCover: {
    type: String,
    required: [true, 'A Book must have an imageCover'],
  },
  images: [String],
  authors: [String],
  createdAt: { type: Date, default: Date.now() },
  publicationDates: [Date],
  price: { type: Number, required: [true, 'A book must have a price'] },
});

// creating Model from Schema
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
