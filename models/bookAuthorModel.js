const mongoose = require('mongoose');

const bookAuthorSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: [true, 'Please provide Book Id.'],
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user id!'],
  },
});

const BookAuthor = mongoose.model('BookAuthor', bookAuthorSchema);

module.exports = BookAuthor;
