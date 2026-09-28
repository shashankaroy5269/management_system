import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import StatusCode from '../utils/statusCode.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'production_super_secret_jwt_access_key_2026'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'User no longer exists',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  }

  if (!token) {
    return res.status(StatusCode.UNAUTHORIZED).json({
      success: false,
      message: 'No token provided, authorization denied',
    });
  }
};

export default protect;
