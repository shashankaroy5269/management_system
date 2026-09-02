import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { taskApi } from '../../api';
import { Loader, EmptyState } from '../common/Loader';
import { StatusBadge, RoleBadge } from '../common/Badge';
import { Clock, ArrowRight, History } from 'lucide-react';

export const TaskHistoryModal = ({ isOpen, onClose, task }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && task?._id) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const res = await taskApi.getTaskById(task._id);
          if (res.data?.success) {
            setHistory(res.data.data.auditTrail || []);
          }
        } catch (err) {
          console.error('Failed to load task audit trail:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchHistory();
    }
  }, [isOpen, task]);

  const getActionLabel = (action) => {
    switch (action) {
      case 'TASK_CREATED':
        return { label: 'Task Created', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'STATUS_UPDATED':
        return { label: 'Status Changed', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'TASK_ASSIGNED':
      case 'TASK_REASSIGNED':
        return { label: 'Reassigned', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'COMMENT_ADDED':
        return { label: 'Comment Added', color: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'ATTACHMENT_UPLOADED':
        return { label: 'Attachment Uploaded', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: action.replace(/_/g, ' '), color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <History className="w-5 h-5 text-blue-600" />
          <span>Audit Trail & History: {task?.title}</span>
        </div>
      }
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <Loader text="Loading immutable audit logs..." />
      ) : history.length === 0 ? (
        <EmptyState title="No history records yet" subtitle="All future state changes will be logged here." />
      ) : (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {history.map((entry, idx) => {
              const { label, color } = getActionLabel(entry.action);
              const formattedTime = new Date(entry.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={entry._id || idx} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white border-2 border-blue-600" />

                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 transition-colors hover:border-slate-300">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
                          {label}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <span className="font-bold text-slate-900">{entry.changedBy?.name || 'System'}</span>
                          {entry.changedBy?.role && <RoleBadge role={entry.changedBy.role} />}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>

                    {/* Status transition pills */}
                    {entry.previousStatus && entry.newStatus && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 my-2">
                        <span className="text-slate-500 font-medium">Status:</span>
                        <StatusBadge status={entry.previousStatus} />
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <StatusBadge status={entry.newStatus} />
                      </div>
                    )}

                    {/* Assignee transition */}
                    {entry.previousAssignee && entry.newAssignee && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 my-2">
                        <span className="text-slate-500 font-medium">Reassigned from:</span>
                        <span className="font-semibold text-slate-800">{entry.previousAssignee.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-blue-600">{entry.newAssignee.name}</span>
                      </div>
                    )}

                    {/* Custom Note */}
                    {entry.note && (
                      <p className="text-xs text-slate-600 mt-1 italic leading-relaxed">
                        "{entry.note}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};
