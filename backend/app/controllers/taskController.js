import Task from '../models/Task.js';
import StatusCode from '../utils/statusCode.js';
import logger from '../utils/logger.js';

class TaskController {
  // 1. Create a New Task (Admin, Manager)
  async createTask(req, res) {
    try {
      const { title, description, priority, dueDate, assignedTo } = req.body;

      if (!title) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Task title is required',
        });
      }

      const task = new Task({
        title,
        description: description || '',
        priority: priority || 'Medium',
        dueDate: dueDate || null,
        assignedTo: assignedTo || null,
        assignedBy: req.user._id,
      });

      const savedTask = await task.save();
      await savedTask.populate('assignedTo', 'name email role');
      await savedTask.populate('assignedBy', 'name email role');

      logger(`Task Created: "${savedTask.title}" by ${req.user.email}`);

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: 'Task created successfully',
        data: savedTask,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 2. Get All Tasks (Role-filtered)
  async getTasks(req, res) {
    try {
      const { search, status, priority, page = 1, limit = 10 } = req.query;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      const filter = { isDeleted: false };

      // Role isolation: Employees only see tasks assigned to them
      if (req.user.role === 'Employee') {
        filter.assignedTo = req.user._id;
      }

      // Search keyword filter
      if (search) {
        filter.title = { $regex: search, $options: 'i' };
      }

      // Status filter
      if (status) {
        filter.status = status;
      }

      // Priority filter
      if (priority) {
        filter.priority = priority;
      }

      const total = await Task.countDocuments(filter);
      const tasks = await Task.find(filter)
        .populate('assignedTo', 'name email role')
        .populate('assignedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: 'Tasks fetched successfully',
        total,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: tasks,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 3. Get Single Task Details
  async getSingleTask(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findOne({ _id: id, isDeleted: false })
        .populate('assignedTo', 'name email role phone')
        .populate('assignedBy', 'name email role phone');

      if (!task) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Task not found',
        });
      }

      // If Employee, make sure it is their assigned task
      if (
        req.user.role === 'Employee' &&
        task.assignedTo?._id?.toString() !== req.user._id.toString()
      ) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: 'You are not authorized to view this task',
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: task,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 4. Update Task (Admin, Manager)
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const { title, description, priority, status, assignedTo, dueDate } = req.body;

      const task = await Task.findOne({ _id: id, isDeleted: false });
      if (!task) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Task not found',
        });
      }

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (status !== undefined) task.status = status;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (dueDate !== undefined) task.dueDate = dueDate || null;

      const updatedTask = await task.save();
      await updatedTask.populate('assignedTo', 'name email role');
      await updatedTask.populate('assignedBy', 'name email role');

      logger(`Task Updated: "${task.title}" by ${req.user.email}`);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 5. Update Task Status (Employee, Manager, Admin)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Invalid status. Must be Pending, In Progress, or Completed.',
        });
      }

      const task = await Task.findOne({ _id: id, isDeleted: false });
      if (!task) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Task not found',
        });
      }

      // If employee, verify they are assigned to this task
      if (
        req.user.role === 'Employee' &&
        task.assignedTo?.toString() !== req.user._id.toString()
      ) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: 'You can only update status of tasks assigned to you',
        });
      }

      task.status = status;
      await task.save();

      logger(`Task Status Changed: "${task.title}" to ${status} by ${req.user.email}`);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: `Task status updated to ${status}`,
        data: task,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 6. Delete Task (Admin only)
  async deleteTask(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );

      if (!task) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Task not found',
        });
      }

      logger(`Task Deleted: "${task.title}" by ${req.user.email}`);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 7. Simple Dashboard Stats
  async getDashboardStats(req, res) {
    try {
      const filter = { isDeleted: false };
      if (req.user.role === 'Employee') {
        filter.assignedTo = req.user._id;
      }

      const totalTasks = await Task.countDocuments(filter);
      const pendingTasks = await Task.countDocuments({ ...filter, status: 'Pending' });
      const inProgressTasks = await Task.countDocuments({ ...filter, status: 'In Progress' });
      const completedTasks = await Task.countDocuments({ ...filter, status: 'Completed' });

      // Recent 5 tasks
      const recentTasks = await Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('assignedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: {
          totalTasks,
          pendingTasks,
          inProgressTasks,
          completedTasks,
          recentTasks,
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

export default new TaskController();
