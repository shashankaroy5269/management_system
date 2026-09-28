import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import StatusCode from '../utils/statusCode.js';
import logger from '../utils/logger.js';
import { sendVerificationEmail } from '../utils/emailService.js';

class AuthController {
  // 1. Register User (Sends Verification Email via Nodemailer)
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
          message: 'User with this email already exists',
        });
      }

      const validRole = ['Admin', 'Manager', 'Employee'].includes(role)
        ? role
        : 'Employee';

      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate verification token (valid for 24 hours)
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: validRole,
        phone: phone || '',
        isVerified: false,
        verificationToken,
        verificationTokenExpires,
      });

      logger(`New User Registered: ${user.email} (${user.role}) - Awaiting Verification`);

      // Dispatch verification email via Nodemailer
      sendVerificationEmail(user, verificationToken).catch((err) =>
        console.error('[Registration Email Error]:', err.message)
      );

      return res.status(StatusCode.CREATED).json({
        success: true,
        message:
          'Registration successful! A verification email has been sent to your inbox. Please click the link to activate your account.',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: false,
        },
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 2. Verify Email Token
  async verifyEmail(req, res) {
    try {
      const token = req.query.token || req.body.token;

      if (!token) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Verification token is required',
        });
      }

      const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Invalid or expired verification token. Please request a new verification email.',
        });
      }

      user.isVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpires = null;
      await user.save();

      logger(`User Verified Email: ${user.email}`);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: 'Your email has been verified successfully! You can now log in to your account.',
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
          message: 'Email is required',
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'No account found with this email address',
        });
      }

      if (user.isVerified) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'This account is already verified. You can proceed to login.',
        });
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationToken = verificationToken;
      user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      await sendVerificationEmail(user, verificationToken);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: 'A fresh verification link has been sent to your email address.',
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 4. Login User (Enforces Email Verification & Account Status)
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
