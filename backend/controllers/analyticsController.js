import User from '../models/User.js';
import Task from '../models/Task.js';
import AssignmentHistory from '../models/AssignmentHistory.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * AnalyticsController - Class-based controller for real-time MongoDB Aggregations
 */
class AnalyticsController {
  /**
   * Aggregate role-tailored workspace dashboard metrics
   */
  async getDashboardAnalytics(req, res, next) {
    try {
      const userRole = req.user.role;
      const userId = req.user._id;

      // 1. ADMIN AGGREGATIONS
      if (userRole === 'admin') {
        const [
          userCounts,
          taskStatusCounts,
          overdueCount,
          recentActivities,
          topEmployees
        ] = await Promise.all([
          User.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$role', count: { $sum: 1 } } }
          ]),
          Task.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]),
          Task.countDocuments({
            isDeleted: false,
            dueDate: { $lt: new Date() },
            status: { $ne: 'Completed' }
          }),
          AssignmentHistory.find()
            .populate('changedBy', 'name email role avatar')
            .populate('taskId', 'title status priority')
            .sort({ createdAt: -1 })
            .limit(8),
          Task.aggregate([
            { $match: { isDeleted: false, status: 'Completed' } },
            { $group: { _id: '$assignedTo', completedCount: { $sum: 1 } } },
            { $sort: { completedCount: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'employee'
              }
            },
            { $unwind: '$employee' },
            {
              $project: {
                name: '$employee.name',
                email: '$employee.email',
                avatar: '$employee.avatar',
                completedCount: 1
              }
            }
          ])
        ]);

        const usersByRole = { admin: 0, manager: 0, employee: 0, total: 0 };
        userCounts.forEach(u => {
          usersByRole[u._id] = u.count;
          usersByRole.total += u.count;
        });

        const tasksByStatus = { Pending: 0, 'In Progress': 0, Completed: 0, Rejected: 0, total: 0 };
        taskStatusCounts.forEach(t => {
          tasksByStatus[t._id] = t.count;
          tasksByStatus.total += t.count;
        });

        return successResponse(res, 200, 'Admin analytics retrieved.', {
          usersByRole,
          tasksByStatus,
          overdueCount,
          recentActivities,
          topEmployees
        });
      }

      // 2. MANAGER AGGREGATIONS
      if (userRole === 'manager') {
        const [
          managerTaskStatus,
          overdueTasks,
          employeeWorkload,
          recentActivities
        ] = await Promise.all([
          Task.aggregate([
            { $match: { assignedBy: userId, isDeleted: false } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]),
          Task.countDocuments({
            assignedBy: userId,
            isDeleted: false,
            dueDate: { $lt: new Date() },
            status: { $ne: 'Completed' }
          }),
          Task.aggregate([
            { $match: { assignedBy: userId, isDeleted: false, status: { $in: ['Pending', 'In Progress'] } } },
            { $group: { _id: '$assignedTo', activeTasks: { $sum: 1 } } },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'employee'
              }
            },
            { $unwind: '$employee' },
            {
              $project: {
                name: '$employee.name',
                email: '$employee.email',
                avatar: '$employee.avatar',
                activeTasks: 1
              }
            }
          ]),
          AssignmentHistory.find()
            .populate('changedBy', 'name email role avatar')
            .populate('taskId', 'title status priority')
            .sort({ createdAt: -1 })
            .limit(6)
        ]);

        const tasksByStatus = { Pending: 0, 'In Progress': 0, Completed: 0, Rejected: 0, total: 0 };
        managerTaskStatus.forEach(t => {
          tasksByStatus[t._id] = t.count;
          tasksByStatus.total += t.count;
        });

        return successResponse(res, 200, 'Manager analytics retrieved.', {
          tasksByStatus,
          overdueTasks,
          employeeWorkload,
          recentActivities
        });
      }

      // 3. EMPLOYEE METRICS
      if (userRole === 'employee') {
        const [
          myTaskStatus,
          overdueCount,
          upcomingTasks
        ] = await Promise.all([
          Task.aggregate([
            { $match: { assignedTo: userId, isDeleted: false } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]),
          Task.countDocuments({
            assignedTo: userId,
            isDeleted: false,
            dueDate: { $lt: new Date() },
            status: { $ne: 'Completed' }
          }),
          Task.find({
            assignedTo: userId,
            isDeleted: false,
            status: { $ne: 'Completed' }
          })
            .sort({ dueDate: 1 })
            .limit(5)
            .populate('assignedBy', 'name email')
        ]);

        const tasksByStatus = { Pending: 0, 'In Progress': 0, Completed: 0, Rejected: 0, total: 0 };
        myTaskStatus.forEach(t => {
          tasksByStatus[t._id] = t.count;
          tasksByStatus.total += t.count;
        });

        return successResponse(res, 200, 'Employee analytics retrieved.', {
          tasksByStatus,
          overdueCount,
          upcomingTasks
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();
