import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import StatusCode from '../utils/statusCode.js';
import logger from '../utils/logger.js';
import { sendVerificationEmail } from '../utils/emailService.js';

class AuthController {
  // 1. Register User (Triggers Email Verification)
  async registerUser(req, res) {
    try {
      const { name, email, password, role, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Please provide all required fields (name, email, password)',
        });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'A user with this email already exists',
        });
      }

      const validRole = ['Admin', 'Manager', 'Employee'].includes(role)
        ? role
        : 'Employee';

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: validRole,
        phone: phone || '',
        isVerified: false,
      });

      // Generate crypto verification token (SHA-256 hashed in DB, raw sent via email)
      const rawVerificationToken = user.createEmailVerificationToken();
      await user.save();

      // Dispatch verification email via Nodemailer
      const emailResult = await sendVerificationEmail(user, rawVerificationToken);

      logger(`New User Registered: ${user.email} (${user.role}) - Verification Sent`);

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: false,
          },
          emailSent: emailResult.success,
          devVerificationUrl: emailResult.verifyUrl,
        },
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 2. Verify User Email Token (supports /verify-email/:token and /verify-email?token=...)
  async verifyEmail(req, res) {
    try {
      const token = req.params.token || req.query.token || req.body.token;

      if (!token) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'No verification token provided in URL',
        });
      }

      // Hash incoming raw token with SHA-256 to match DB record
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Verification token is invalid or has expired',
        });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();

      logger(`User Email Verified: ${user.email}`);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: 'Email verified successfully! Your account is now active.',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: true,
          },
        },
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 3. Resend Verification Email
  async resendVerification(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Please provide an email address',
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'No user found with this email address',
        });
      }

      if (user.isVerified) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'This account has already been verified',
        });
      }

      const rawToken = user.createEmailVerificationToken();
      await user.save();

      const emailResult = await sendVerificationEmail(user, rawToken);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: 'A fresh verification link has been sent to your email address.',
        data: {
          devVerificationUrl: emailResult.verifyUrl,
        },
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 4. Login User (Guards against unverified emails)
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Please provide both email and password',
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid email address or user not found',
        });
      }

      // Check if email has been verified
      if (!user.isVerified) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          isUnverified: true,
          message:
            'Please verify your email address before logging in. Check your inbox for the activation link.',
        });
      }

      if (!user.isActive) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: 'Your account has been deactivated. Please contact an administrator.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid password credentials',
        });
      }

      logger(`User Login: ${user.email}`);

      const token = generateToken(user._id, user.role);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: 'Login Successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          token,
        },
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 5. Get Current User Profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new AuthController();
