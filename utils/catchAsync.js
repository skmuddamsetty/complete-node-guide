const catchAsync = (fn) => {
  // returning an anonymous function
  // this anonymous function will be assigned to variable that we are assigning the catchAsync function to.
  // this function is called as soon as there is a request to the route.
  // For ex: createTour
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

module.exports = catchAsync;
