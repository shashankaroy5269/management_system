import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import StatusCode from '../utils/statusCode.js';
import logger from '../utils/logger.js';

class AuthController {
  // 1. Register User
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

      // Default to Employee if role is not specified or invalid
      const validRole = ['Admin', 'Manager', 'Employee'].includes(role)
        ? role
        : 'Employee';

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: validRole,
        phone: phone || '',
      });

      logger(`New User Registered: ${user.email} (${user.role})`);

      const token = generateToken(user._id, user.role);

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: 'User Registered Successfully',
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

  // 2. Login User
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
          message: 'Invalid email address',
        });
      }

      if (!user.isActive) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: 'Your account has been deactivated. Please contact an admin.',
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

  // 3. Get Current User Profile
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
