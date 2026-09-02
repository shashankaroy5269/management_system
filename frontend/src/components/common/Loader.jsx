import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-xs font-medium text-slate-500">{text}</p>
    </div>
  );
};

export const EmptyState = ({ title = 'No data available', subtitle, icon: Icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-dashed border-slate-200 rounded-2xl my-4">
      {Icon && (
        <div className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 border border-slate-100 mb-3 shadow-sm">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{subtitle}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
