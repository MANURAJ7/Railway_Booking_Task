export const asyncHandler = (requestHandlerFunc) => {
  return (req, res, next) => {
    Promise.resolve(requestHandlerFunc(req, res, next)).catch((err) =>
      next(err)
    );
  };
};
// a wrapping function for better error handling like try catch, this returns a function (not just promise) that promises to execute the HandlerFunc and catch errors.
