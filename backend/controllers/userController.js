import User from '../models/User.js';
import Task from '../models/Task.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';

/**
 * UserController - Class-based controller for User CRUD, Role Management, and Status toggles
 */
class UserController {
  /**
   * Get all users with search, role filters, and pagination
   */
  async getUsers(req, res, next) {
    try {
      const { page, limit, search, role, status } = req.query;
      const { page: currentPage, limit: perPage, skip } = getPagination(page, limit);

      const query = { isDeleted: false };

      if (req.user.role === 'manager') {
        query.role = 'employee';
      } else if (role && ['admin', 'manager', 'employee'].includes(role)) {
        query.role = role;
      }

      if (status && ['active', 'inactive'].includes(status)) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      const [users, total] = await Promise.all([
        User.find(query).skip(skip).limit(perPage).sort({ createdAt: -1 }),
        User.countDocuments(query)
      ]);

      const formattedData = formatPaginatedResponse(total, currentPage, perPage, users);
      return successResponse(res, 200, 'Users retrieved successfully.', formattedData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get list of active employees for task assignment dropdowns
   */
  async getActiveEmployees(req, res, next) {
    try {
      const employees = await User.find({
        role: 'employee',
        status: 'active',
        isDeleted: false
      }).select('_id name email avatar');

      return successResponse(res, 200, 'Active employees retrieved.', { employees });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single user by ID with workload stats
   */
  async getUserById(req, res, next) {
    try {
      const user = await User.findById(req.params.id);

      if (!user || user.isDeleted) {
        return errorResponse(res, 404, 'User not found.');
      }

      if (req.user.role === 'employee' && req.user.id !== user._id.toString()) {
        return errorResponse(res, 403, 'Unauthorized to view this profile.');
      }

      const [assignedCount, completedCount] = await Promise.all([
        Task.countDocuments({ assignedTo: user._id, isDeleted: false }),
        Task.countDocuments({ assignedTo: user._id, status: 'Completed', isDeleted: false })
      ]);

      return successResponse(res, 200, 'User profile retrieved.', {
        user,
        stats: {
          totalAssignedTasks: assignedCount,
          completedTasks: completedCount,
          pendingTasks: assignedCount - completedCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new user (Admin only)
   */
  async createUser(req, res, next) {
    try {
      const { name, email, password, role, phone } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return errorResponse(res, 400, 'A user with this email address already exists.');
      }

      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password: password || 'Default@123456',
        role: role || 'employee',
        phone: phone || ''
      });

      return successResponse(res, 201, `User '${newUser.name}' created successfully.`, {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user details and role
   */
  async updateUser(req, res, next) {
    try {
      const { name, phone, avatar, role, status } = req.body;
      const userToUpdate = await User.findById(req.params.id);

      if (!userToUpdate || userToUpdate.isDeleted) {
        return errorResponse(res, 404, 'User not found.');
      }

      if (req.user.role !== 'admin' && req.user.id !== userToUpdate._id.toString()) {
        return errorResponse(res, 403, 'Permission denied.');
      }

      if (name) userToUpdate.name = name;
      if (phone !== undefined) userToUpdate.phone = phone;
      if (avatar !== undefined) userToUpdate.avatar = avatar;

      if (req.user.role === 'admin') {
        if (role && ['admin', 'manager', 'employee'].includes(role)) {
          userToUpdate.role = role;
        }
        if (status && ['active', 'inactive'].includes(status)) {
          userToUpdate.status = status;
        }
      }

      await userToUpdate.save();
      return successResponse(res, 200, 'User profile updated.', { user: userToUpdate });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle Active / Inactive status (Admin only)
   */
  async toggleUserStatus(req, res, next) {
    try {
      const user = await User.findById(req.params.id);

      if (!user || user.isDeleted) {
        return errorResponse(res, 404, 'User not found.');
      }

      if (req.user.id === user._id.toString()) {
        return errorResponse(res, 400, 'You cannot deactivate your own admin account.');
      }

      user.status = user.status === 'active' ? 'inactive' : 'active';
      await user.save();

      return successResponse(res, 200, `User is now ${user.status}.`, {
        id: user._id,
        status: user.status
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft delete user account (Admin only)
   */
  async softDeleteUser(req, res, next) {
    try {
      const user = await User.findById(req.params.id);

      if (!user || user.isDeleted) {
        return errorResponse(res, 404, 'User not found.');
      }

      if (req.user.id === user._id.toString()) {
        return errorResponse(res, 400, 'Admins cannot delete their own account.');
      }

      user.isDeleted = true;
      user.status = 'inactive';
      await user.save();

      return successResponse(res, 200, `User '${user.name}' soft deleted successfully.`);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
