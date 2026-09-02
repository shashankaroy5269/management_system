import AssignmentHistory from '../models/AssignmentHistory.js';

/**
 * AuditService - Class-based service for recording and retrieving immutable audit trails
 */
class AuditService {
  /**
   * Log an assignment or state change event
   */
  async logHistory({
    taskId,
    changedBy,
    action,
    previousAssignee = null,
    newAssignee = null,
    previousStatus = null,
    newStatus = null,
    note = ''
  }) {
    try {
      return await AssignmentHistory.create({
        taskId,
        changedBy,
        action,
        previousAssignee,
        newAssignee,
        previousStatus,
        newStatus,
        note
      });
    } catch (error) {
      console.error('[AuditService Error]: Failed to create history entry:', error.message);
      return null;
    }
  }

  /**
   * Retrieve chronological audit trail for a task
   */
  async getTaskHistory(taskId) {
    return await AssignmentHistory.find({ taskId })
      .populate('changedBy', 'name email role avatar')
      .populate('previousAssignee', 'name email role avatar')
      .populate('newAssignee', 'name email role avatar')
      .sort({ createdAt: -1 });
  }
}

export default new AuditService();
