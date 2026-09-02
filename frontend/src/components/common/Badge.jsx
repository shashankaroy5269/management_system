import React from 'react';

/**
 * Task Status Badge - Crisp, high-contrast SaaS badge
 */
export const StatusBadge = ({ status }) => {
  const statusStyles = {
    Pending: 'bg-amber-50 text-amber-800 border-amber-200/80',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200/80',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200/80'
  };

  const dotColors = {
    Pending: 'bg-amber-500',
    'In Progress': 'bg-blue-500',
    Completed: 'bg-emerald-500',
    Rejected: 'bg-rose-500'
  };

  const currentStyle = statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const dotColor = dotColors[status] || 'bg-slate-400';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`} />
      {status}
    </span>
  );
};

/**
 * Task Priority Badge - Modern SaaS flag tag
 */
export const PriorityBadge = ({ priority }) => {
  const priorityStyles = {
    Low: 'bg-slate-100 text-slate-600 border-slate-200',
    Medium: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200',
    Urgent: 'bg-red-50 text-red-700 border-red-200 font-bold'
  };

  const currentStyle = priorityStyles[priority] || priorityStyles.Medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${currentStyle}`}>
      {priority}
    </span>
  );
};

/**
 * Role Badge - Professional user role indicator
 */
export const RoleBadge = ({ role }) => {
  const roleStyles = {
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    manager: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    employee: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const currentStyle = roleStyles[role] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${currentStyle}`}>
      {role}
    </span>
  );
};
