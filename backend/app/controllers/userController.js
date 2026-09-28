import User from '../models/User.js';
import StatusCode from '../utils/statusCode.js';
import logger from '../utils/logger.js';

class UserController {
  // 1. Get All Users (Admin)
  async getAllUsers(req, res) {
    try {
      const { search, role } = req.query;
      const filter = {};

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      if (role) {
        filter.role = role;
      }

      const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        total: users.length,
        data: users,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 2. Get Employees for Task Assignment Dropdown (Admin & Manager)
  async getEmployees(req, res) {
    try {
      const employees = await User.find({
        role: 'Employee',
        isActive: true,
      })
        .select('_id name email phone')
        .sort({ name: 1 });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: employees,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 3. Toggle User Active Status (Admin)
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'User not found',
        });
      }

      // Prevent deactivating own account
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'You cannot deactivate your own account',
        });
      }

      user.isActive = !user.isActive;
      await user.save();

      logger(`User Status Toggled: ${user.email} isActive=${user.isActive} by ${req.user.email}`);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          _id: user._id,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new UserController();
