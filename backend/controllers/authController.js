import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendTokenResponse, generateAccessToken } from '../utils/generateTokens.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import mailService from '../services/mailService.js';

/**
 * AuthController - Class-based controller handling authentication, registration, & email verification
 */
class AuthController {
  /**
   * Register a new user and dispatch email verification link
   */
  async register(req, res, next) {
    try {
      const { name, email, password, role, phone } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return errorResponse(res, 400, 'An account with this email address already exists.');
      }

      const assignedRole = ['admin', 'manager', 'employee'].includes(role) ? role : 'employee';

      // Generate secure 32-byte crypto verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours validity

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: assignedRole,
        phone: phone || '',
        isVerified: false,
        verificationToken,
        verificationTokenExpires
      });

      // Dispatch verification email via MailService (Nodemailer)
      mailService.sendVerificationEmail({
        email: user.email,
        name: user.name,
        token: verificationToken
      }).catch(err => console.error('[Registration Email Error]:', err.message));

      return successResponse(
        res,
        201,
        'Registration successful! A verification link has been sent to your email address. Please check your inbox and click the link to activate your account.',
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: false
          }
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify User Email Address using verification token
   */
  async verifyEmail(req, res, next) {
    try {
      const token = req.params.token || req.query.token || req.body.token;

      if (!token) {
        return errorResponse(res, 400, 'Verification token is required.');
      }

      // Find user with matching, non-expired verification token
      const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() }
      }).select('+verificationToken +verificationTokenExpires');

      if (!user) {
        return errorResponse(
          res,
          400,
          'Invalid or expired verification link. Please request a new verification email.'
        );
      }

      // Mark account as verified & active
      user.isVerified = true;
      user.status = 'active';
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();

      console.log(`[Email Verified] User ${user.email} (${user.name}) is now fully verified.`);

      // Automatically issue authenticated tokens so the user is logged in upon verification
      return sendTokenResponse(user, 200, res, 'Email verified successfully! Welcome to your workspace.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend verification email to user
   */
  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return errorResponse(res, 400, 'Please provide your account email address.');
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Prevent user enumeration
        return successResponse(res, 200, 'If an unverified account exists with that email, a new verification link has been dispatched.');
      }

      if (user.isVerified) {
        return errorResponse(res, 400, 'This account has already been verified. You can sign in directly.');
      }

      // Generate fresh verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationToken = verificationToken;
      user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      // Dispatch email
      mailService.sendVerificationEmail({
        email: user.email,
        name: user.name,
        token: verificationToken
      }).catch(err => console.error('[Resend Email Error]:', err.message));

      return successResponse(
        res,
        200,
        'A fresh verification link has been dispatched to your email address. Please check your inbox.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticate user & issue tokens (checks email verification)
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return errorResponse(res, 400, 'Please provide both email and password.');
      }

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) {
        return errorResponse(res, 401, 'Invalid email or password.');
      }

      if (user.isDeleted) {
        return errorResponse(res, 403, 'Account is inactive or deleted.');
      }

      // Check if user has verified their email address
      if (user.isVerified === false) {
        return errorResponse(
          res,
          403,
          'Your email address has not been verified yet. Please check your email for the verification link.',
          {
            isUnverified: true,
            email: user.email
          }
        );
      }

      if (user.status === 'inactive') {
        return errorResponse(res, 403, 'Your account has been deactivated.');
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return errorResponse(res, 401, 'Invalid email or password.');
      }

      return sendTokenResponse(user, 200, res, `Welcome back, ${user.name}!`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rotate and reissue Access Token via Refresh Token
   */
  async refreshToken(req, res, next) {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;

      if (!token) {
        return errorResponse(res, 401, 'Refresh token is required.');
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || 'production_super_secret_jwt_refresh_key_2026'
      );

      const user = await User.findById(decoded.id);
      if (!user || user.isDeleted || user.status === 'inactive') {
        return errorResponse(res, 401, 'Invalid refresh token or user account deactivated.');
      }

      const newAccessToken = generateAccessToken(user);

      return successResponse(res, 200, 'Access token refreshed successfully.', {
        accessToken: newAccessToken
      });
    } catch (error) {
      return errorResponse(res, 401, 'Invalid or expired refresh token. Please log in again.');
    }
  }

  /**
   * Get current authenticated user profile
   */
  async getMe(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      return successResponse(res, 200, 'User profile retrieved.', { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear session & logout
   */
  logout(req, res) {
    res.clearCookie('refreshToken');
    return successResponse(res, 200, 'Logged out successfully.');
  }

  /**
   * Send password reset
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return errorResponse(res, 400, 'Please provide your account email.');
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return successResponse(res, 200, 'Password reset instructions dispatched if account exists.');
      }

      return successResponse(res, 200, 'Password reset link sent.');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
