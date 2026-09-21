// Wraps an async route handler so any thrown error (or rejected promise)
// is automatically passed to Express's error handler via next(err),
// instead of us writing try/catch in every single controller function.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
