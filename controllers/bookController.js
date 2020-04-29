const Book = require('../models/bookModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.createBook = catchAsync(async (req, res, next) => {
  const book = await Book.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      book,
    },
  });
});

exports.getAllBooks = catchAsync(async (req, res, next) => {
  const books = await Book.find();
  res
    .status(200)
    .json({ status: 'success', results: books.length, data: { books } });
});

exports.getBook = catchAsync(async (req, res, next) => {
  const book = await Book.findById({ _id: req.params.id });
  if (!book) {
    return next(
      new AppError(`Book with ID: ${req.params.id} is not found!`, 404)
    );
  }
  res.status(200).json({ status: 'success', data: { book } });
});

exports.updateBook = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!book) {
    return next(
      new AppError(`Book with ID: ${req.params.id} is not found!`, 404)
    );
  }
  res.status(200).json({ status: 'success', data: { book } });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) {
    return next(
      new AppError(`Book with ID: ${req.params.id} is not found!`, 404)
    );
  }
  res.status(204).json({ status: 'success', data: null });
});

exports.getAllBooksV2 = factory.getAll(Book);
exports.createBookV2 = factory.createOne(Book);
exports.updateBookV2 = factory.updateOne(Book);
exports.deleteBookV2 = factory.deleteOne(Book);
exports.getBookV2 = factory.getOne(Book);
