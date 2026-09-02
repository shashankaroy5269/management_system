import Task from '../models/Task.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';
import auditService from '../services/auditService.js';
import mailService from '../services/mailService.js';
import { uploadFileToCloudinary } from '../config/cloudinary.js';

/**
 * TaskController - Class-based controller managing Task Workflows, Permissions, and Audits
 */
class TaskController {
  /**
   * Get all tasks with role-based visibility and filters
   */
  async getTasks(req, res, next) {
    try {
      const { page, limit, search, status, priority, assignedTo, assignedBy, overdue } = req.query;
      const { page: currentPage, limit: perPage, skip } = getPagination(page, limit);

      const query = { isDeleted: false };

      // Role isolation
      if (req.user.role === 'employee') {
        query.assignedTo = req.user._id;
      } else if (assignedTo) {
        query.assignedTo = assignedTo;
      }

      if (assignedBy) query.assignedBy = assignedBy;
      if (status) query.status = status;
      if (priority) query.priority = priority;

      if (overdue === 'true') {
        query.dueDate = { $lt: new Date() };
        query.status = { $ne: 'Completed' };
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const [tasks, total] = await Promise.all([
        Task.find(query)
          .populate('assignedTo', 'name email role avatar')
          .populate('assignedBy', 'name email role avatar')
          .populate('comments.user', 'name email role avatar')
          .skip(skip)
          .limit(perPage)
          .sort({ createdAt: -1 }),
        Task.countDocuments(query)
      ]);

      const formattedData = formatPaginatedResponse(total, currentPage, perPage, tasks);
      return successResponse(res, 200, 'Tasks retrieved successfully.', formattedData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single task by ID with full audit history
   */
  async getTaskById(req, res, next) {
    try {
      const task = await Task.findOne({ _id: req.params.id, isDeleted: false })
        .populate('assignedTo', 'name email role avatar phone')
        .populate('assignedBy', 'name email role avatar phone')
        .populate('comments.user', 'name email role avatar')
        .populate('attachments.uploadedBy', 'name email role');

      if (!task) {
        return errorResponse(res, 404, 'Task not found.');
      }

      if (req.user.role === 'employee' && task.assignedTo._id.toString() !== req.user.id) {
        return errorResponse(res, 403, 'Unauthorized to view this task.');
      }

      const auditTrail = await auditService.getTaskHistory(task._id);

      return successResponse(res, 200, 'Task retrieved successfully.', {
        task,
        auditTrail
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create and assign a new task
   */
  async createTask(req, res, next) {
    try {
      const { title, description, assignedTo, priority, dueDate } = req.body;

      if (!title || !assignedTo || !dueDate) {
        return errorResponse(res, 400, 'Title, assignedTo employee, and dueDate are required.');
      }

      const employee = await User.findOne({
        _id: assignedTo,
        isDeleted: false,
        status: 'active'
      });

      if (!employee) {
        return errorResponse(res, 400, 'Selected assignee user does not exist or is inactive.');
      }

      const task = await Task.create({
        title,
        description: description || '',
        assignedBy: req.user._id,
        assignedTo: employee._id,
        priority: priority || 'Medium',
        dueDate: new Date(dueDate)
      });

      // Log Audit Trail
      await auditService.logHistory({
        taskId: task._id,
        changedBy: req.user._id,
        action: 'TASK_CREATED',
        newAssignee: employee._id,
        newStatus: 'Pending',
        note: `Task created and assigned to ${employee.name} with ${task.priority} priority.`
      });

      // Dispatch Email Notification
      mailService.sendTaskAssignedEmail({
        employeeEmail: employee.email,
        employeeName: employee.name,
        taskTitle: task.title,
        managerName: req.user.name,
        dueDate: task.dueDate,
        priority: task.priority
      }).catch(err => console.error('[Background Email Error]:', err.message));

      const populatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email role avatar')
        .populate('assignedBy', 'name email role avatar');

      return successResponse(res, 201, 'Task created and assigned successfully.', { task: populatedTask });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update task metadata (Title, Description, Priority, Due Date)
   */
  async updateTask(req, res, next) {
    try {
      const { title, description, priority, dueDate } = req.body;
      const task = await Task.findOne({ _id: req.params.id, isDeleted: false });

      if (!task) {
        return errorResponse(res, 404, 'Task not found.');
      }

      if (req.user.role === 'manager' && task.assignedBy.toString() !== req.user.id) {
        return errorResponse(res, 403, 'Managers can only update tasks created by themselves.');
      }

      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = new Date(dueDate);

      await task.save();

      await auditService.logHistory({
        taskId: task._id,
        changedBy: req.user._id,
        action: 'DETAILS_UPDATED',
        note: `Task details updated by ${req.user.name}.`
      });

      const updatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email role avatar')
        .populate('assignedBy', 'name email role avatar');

      return successResponse(res, 200, 'Task updated successfully.', { task: updatedTask });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change task workflow status (Pending -> In Progress -> Completed)
   */
  async changeTaskStatus(req, res, next) {
    try {
      const { status, note } = req.body;
      const validStatuses = ['Pending', 'In Progress', 'Completed', 'Rejected'];

      if (!status || !validStatuses.includes(status)) {
        return errorResponse(res, 400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const task = await Task.findOne({ _id: req.params.id, isDeleted: false })
        .populate('assignedBy', 'name email')
        .populate('assignedTo', 'name email');

      if (!task) {
        return errorResponse(res, 404, 'Task not found.');
      }

      if (req.user.role === 'employee' && task.assignedTo._id.toString() !== req.user.id) {
        return errorResponse(res, 403, 'You can only update status for your own assigned tasks.');
      }

      const previousStatus = task.status;
      task.status = status;
      await task.save();

      // Log Audit History
      await auditService.logHistory({
        taskId: task._id,
        changedBy: req.user._id,
        action: 'STATUS_UPDATED',
        previousStatus,
        newStatus: status,
        note: note || `Status transitioned from ${previousStatus} to ${status} by ${req.user.name}.`
      });

      // Dispatch Email to Manager if completed by employee
      if (req.user.role === 'employee' && task.assignedBy?.email) {
        mailService.sendTaskStatusUpdatedEmail({
          recipientEmail: task.assignedBy.email,
          recipientName: task.assignedBy.name,
          taskTitle: task.title,
          updatedByName: req.user.name,
          newStatus: status
        }).catch(err => console.error('[Background Email Error]:', err.message));
      }

      return successResponse(res, 200, `Task status changed to '${status}'.`, { task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reassign task to a different employee
   */
  async assignTask(req, res, next) {
    try {
      const { assignedTo, note } = req.body;

      if (!assignedTo) {
        return errorResponse(res, 400, 'New assignee ID is required.');
      }

      const [task, newAssignee] = await Promise.all([
        Task.findOne({ _id: req.params.id, isDeleted: false }),
        User.findOne({ _id: assignedTo, isDeleted: false, status: 'active' })
      ]);

      if (!task) return errorResponse(res, 404, 'Task not found.');
      if (!newAssignee) return errorResponse(res, 400, 'New assignee user is invalid or inactive.');

      const previousAssigneeId = task.assignedTo;
      task.assignedTo = newAssignee._id;
      await task.save();

      await auditService.logHistory({
        taskId: task._id,
        changedBy: req.user._id,
        action: 'TASK_REASSIGNED',
        previousAssignee: previousAssigneeId,
        newAssignee: newAssignee._id,
        note: note || `Task reassigned to ${newAssignee.name} by ${req.user.name}.`
      });

      mailService.sendTaskAssignedEmail({
        employeeEmail: newAssignee.email,
        employeeName: newAssignee.name,
        taskTitle: task.title,
        managerName: req.user.name,
        dueDate: task.dueDate,
        priority: task.priority
      }).catch(err => console.error('[Background Email Error]:', err.message));

      const updatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email role avatar')
        .populate('assignedBy', 'name email role avatar');

      return successResponse(res, 200, `Task reassigned to ${newAssignee.name}.`, { task: updatedTask });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add comment to task discussion
   */
  async addComment(req, res, next) {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return errorResponse(res, 400, 'Comment cannot be empty.');
      }

      const task = await Task.findOne({ _id: req.params.id, isDeleted: false });
      if (!task) return errorResponse(res, 404, 'Task not found.');

      if (req.user.role === 'employee' && task.assignedTo.toString() !== req.user.id) {
        return errorResponse(res, 403, 'Unauthorized to comment on this task.');
      }

      task.comments.push({
        user: req.user._id,
        text: text.trim(),
        createdAt: new Date()
      });
      await task.save();

      await auditService.logHistory({
        taskId: task._id,
        changedBy: req.user._id,
        action: 'COMMENT_ADDED',
        note: `${req.user.name} posted a comment.`
      });

      const populatedTask = await Task.findById(task._id)
        .populate('comments.user', 'name email role avatar');

      return successResponse(res, 201, 'Comment added.', { comments: populatedTask.comments });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload file attachment
   */
  async uploadAttachment(req, res, next) {
    try {
      if (!req.file) return errorResponse(res, 400, 'Please select a file to upload.');

      const task = await Task.findOne({ _id: req.params.id, isDeleted: false });
      if (!task) return errorResponse(res, 404, 'Task not found.');

      if (req.user.role === 'employee' && task.assignedTo.toString() !== req.user.id) {
        return errorResponse(res, 403, 'Unauthorized.');
      }

      const uploadResult = await uploadFileToCloudinary(req.file.path, 'task_attachments');

      task.attachments.push({
        name: req.file.originalname,
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        uploadedBy: req.user._id,
        uploadedAt: new Date()
      });
      await task.save();

      await auditService.logHistory({
        taskId: task._id,
        changedBy: req.user._id,
        action: 'ATTACHMENT_UPLOADED',
        note: `File '${req.file.originalname}' uploaded by ${req.user.name}.`
      });

      return successResponse(res, 201, 'Attachment uploaded.', { attachments: task.attachments });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft delete task
   */
  async deleteTask(req, res, next) {
    try {
      const task = await Task.findOne({ _id: req.params.id, isDeleted: false });
      if (!task) return errorResponse(res, 404, 'Task not found.');

      task.isDeleted = true;
      await task.save();

      await auditService.logHistory({
        taskId: task._id,
        changedBy: req.user._id,
        action: 'TASK_DELETED',
        note: `Task soft deleted by Admin ${req.user.name}.`
      });

      return successResponse(res, 200, 'Task deleted successfully.');
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
