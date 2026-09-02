import mongoose from 'mongoose';

/**
 * Assignment History Schema
 * Immutable audit trail tracking task lifecycle, ownership changes, and status shifts.
 * Crucial for enterprise compliance, productivity metrics, and audit logs.
 */
const assignmentHistorySchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: [
        'TASK_CREATED',
        'TASK_ASSIGNED',
        'TASK_REASSIGNED',
        'STATUS_UPDATED',
        'PRIORITY_UPDATED',
        'DETAILS_UPDATED',
        'COMMENT_ADDED',
        'ATTACHMENT_UPLOADED',
        'TASK_DELETED'
      ],
      required: true
    },
    previousAssignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    newAssignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    previousStatus: {
      type: String,
      default: null
    },
    newStatus: {
      type: String,
      default: null
    },
    note: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

assignmentHistorySchema.index({ taskId: 1, createdAt: -1 });
assignmentHistorySchema.index({ changedBy: 1 });

const AssignmentHistory = mongoose.model('AssignmentHistory', assignmentHistorySchema);
export default AssignmentHistory;
