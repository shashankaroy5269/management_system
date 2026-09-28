import StatusCode from '../utils/statusCode.js';

const errorHandler = (err, req, res, next) => {
  console.error('[Server Error]:', err.message);
  const status = err.statusCode || StatusCode.SERVER_ERROR;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
