import React from 'react';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { History, Eye, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TaskTable = ({
  tasks,
  onStatusChange,
  onOpenHistory,
  onEditTask,
  onDeleteTask,
  userRole
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th scope="col" className="px-5 py-3.5">Task Title</th>
              <th scope="col" className="px-5 py-3.5">Priority</th>
              <th scope="col" className="px-5 py-3.5">Assignee</th>
              <th scope="col" className="px-5 py-3.5">Due Date</th>
              <th scope="col" className="px-5 py-3.5">Status</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
              return (
                <tr key={task._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4 max-w-xs">
                    <Link
                      to={`/tasks/${task._id}`}
                      className="font-bold text-slate-900 hover:text-blue-600 block truncate"
                    >
                      {task.title}
                    </Link>
                    <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {task.description || 'No description provided'}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <PriorityBadge priority={task.priority} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-[10px]">
                        {task.assignedTo?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 truncate">{task.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    {isOverdue && (
                      <span className="ml-1.5 text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                        Overdue
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task._id, e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenHistory(task)}
                        title="Audit Log"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      <Link
                        to={`/tasks/${task._id}`}
                        title="View Details"
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {(userRole === 'admin' || userRole === 'manager') && onEditTask && (
                        <button
                          onClick={() => onEditTask(task)}
                          title="Edit Task"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {userRole === 'admin' && onDeleteTask && (
                        <button
                          onClick={() => onDeleteTask(task)}
                          title="Delete Task"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
