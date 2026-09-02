/**
 * ErrorMiddleware - Class-based Centralized Error and 404 Handler
 */
class ErrorMiddleware {
  /**
   * Central Express Error Handler
   */
  handle(err, req, res, next) {
    let error = { ...err };
    error.message = err.message;

    if (process.env.NODE_ENV !== 'production') {
      console.error('[Error Trace]:', err);
    }

    // 1. Invalid MongoDB ObjectId
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Resource not found with id: '${err.value}'`,
        errorType: 'CastError'
      });
    }

    // 2. Duplicate Key Error (11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate value '${err.keyValue[field]}' for field '${field}'.`,
        errorType: 'DuplicateKeyError'
      });
    }

    // 3. Mongoose Validation Error
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed on input data',
        errors,
        errorType: 'ValidationError'
      });
    }

    // 4. JWT Errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token',
        errorType: 'JsonWebTokenError'
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again',
        errorType: 'TokenExpiredError'
      });
    }

    // 5. Generic Error
    const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }

  /**
   * 404 Route Not Found
   */
  notFound(req, res, next) {
    const error = new Error(`Route not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  }
}

const errorMiddleware = new ErrorMiddleware();
export const errorHandler = errorMiddleware.handle.bind(errorMiddleware);
export const notFound = errorMiddleware.notFound.bind(errorMiddleware);
export default errorMiddleware;
