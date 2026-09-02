import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * AuthMiddleware - Class-based authentication & RBAC guards
 */
class AuthMiddleware {
  /**
   * Verify JWT Token and active account
   */
  async protect(req, res, next) {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, 401, 'Access denied. No authentication token provided.');
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'production_super_secret_jwt_access_key_2026'
      );

      const user = await User.findById(decoded.id);

      if (!user || user.isDeleted) {
        return errorResponse(res, 401, 'User account associated with this token is invalid or deleted.');
      }

      if (user.status === 'inactive') {
        return errorResponse(res, 403, 'Your account has been deactivated.');
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Session expired. Please log in again.');
      }
      return errorResponse(res, 401, 'Invalid authentication token.');
    }
  }

  /**
   * RBAC authorization check
   */
  authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return errorResponse(
          res,
          403,
          `Forbidden: Role '${req.user?.role}' is not authorized to access this resource.`
        );
      }
      next();
    };
  }
}

const authMiddleware = new AuthMiddleware();
export const protect = authMiddleware.protect.bind(authMiddleware);
export const authorizeRoles = authMiddleware.authorizeRoles.bind(authMiddleware);
export default authMiddleware;
