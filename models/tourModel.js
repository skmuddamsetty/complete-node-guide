const mongoose = require('mongoose');

// defining schema using mongoose
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: { type: Number, default: 4.5 },
  price: { type: Number, required: [true, 'A tour must have a price'] },
});

// creating Model from Schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
