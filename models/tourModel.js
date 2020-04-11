const mongoose = require('mongoose');

// defining schema using mongoose
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
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
  createdAt: { type: Date, default: Date.now() },
  startDates: [Date],
  price: { type: Number, required: [true, 'A tour must have a price'] },
});

// creating Model from Schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
