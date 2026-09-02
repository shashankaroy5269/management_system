import React from 'react';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { Calendar, MessageSquare, Paperclip, History } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TaskCard = ({ task, onStatusChange, onOpenHistory, userRole }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <PriorityBadge priority={task.priority} />
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenHistory(task)}
              title="View Audit Trail History"
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
            </button>
            <StatusBadge status={task.status} />
          </div>
        </div>

        {/* Title */}
        <Link
          to={`/tasks/${task._id}`}
          className="text-sm font-bold text-slate-900 hover:text-blue-600 line-clamp-2 transition-colors mb-2 block leading-snug"
        >
          {task.title}
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {task.description || 'No additional description provided.'}
        </p>
      </div>

      <div>
        {/* Due Date & Attachments/Comments Count */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mb-3">
          <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
            {isOverdue && <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Overdue</span>}
          </div>

          <div className="flex items-center gap-2.5 text-slate-400 text-xs">
            {task.attachments?.length > 0 && (
              <span className="flex items-center gap-1 hover:text-slate-600">
                <Paperclip className="w-3.5 h-3.5" />
                {task.attachments.length}
              </span>
            )}
            <span className="flex items-center gap-1 hover:text-slate-600">
              <MessageSquare className="w-3.5 h-3.5" />
              {task.comments?.length || 0}
            </span>
          </div>
        </div>

        {/* Assignee & Quick Status Dropdown */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-[10px]">
              {task.assignedTo?.name?.charAt(0).toUpperCase() || 'E'}
            </div>
            <span className="text-xs font-semibold text-slate-700 truncate max-w-[110px]" title={task.assignedTo?.name}>
              {task.assignedTo?.name || 'Unassigned'}
            </span>
          </div>

          {/* Quick status selector */}
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>
    </div>
  );
};
