import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskApi, userApi } from '../api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { TaskComments } from '../components/tasks/TaskComments';
import { TaskHistoryModal } from '../components/tasks/TaskHistoryModal';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { 
  ArrowLeft, 
  Calendar, 
  Paperclip, 
  Upload, 
  History, 
  UserPlus, 
  Download
} from 'lucide-react';

export const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Reassignment Modal state
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [reassignNote, setReassignNote] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  const fetchTaskDetails = async () => {
    try {
      const res = await taskApi.getTaskById(id);
      if (res.data?.success) {
        setTask(res.data.data.task);
        setAuditTrail(res.data.data.auditTrail || []);
      }
    } catch (error) {
      console.error('Failed to load task details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  // Handle status update
  const handleStatusChange = async (newStatus) => {
    try {
      const res = await taskApi.changeStatus(id, { status: newStatus });
      if (res.data?.success) {
        setTask((prev) => ({ ...prev, status: newStatus }));
        fetchTaskDetails();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await taskApi.uploadAttachment(id, formData);
      if (res.data?.success) {
        setTask((prev) => ({ ...prev, attachments: res.data.data.attachments }));
        fetchTaskDetails();
      }
    } catch (error) {
      console.error('Attachment upload error:', error);
      alert(error.response?.data?.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Handle comment submit
  const handleAddComment = async (text) => {
    setIsAddingComment(true);
    try {
      const res = await taskApi.addComment(id, text);
      if (res.data?.success) {
        setTask((prev) => ({ ...prev, comments: res.data.data.comments }));
        fetchTaskDetails();
      }
    } catch (error) {
      console.error('Add comment error:', error);
      alert(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  // Open Reassign Modal
  const handleOpenReassign = async () => {
    try {
      const res = await userApi.getActiveEmployees();
      if (res.data?.success) {
        setEmployees(res.data.data.employees || []);
        setSelectedAssignee(task?.assignedTo?._id || '');
        setIsReassignModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to load employees for reassignment:', error);
    }
  };

  // Submit Reassignment
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignee) return;

    setIsReassigning(true);
    try {
      const res = await taskApi.assignTask(id, {
        assignedTo: selectedAssignee,
        note: reassignNote
      });
      if (res.data?.success) {
        setIsReassignModalOpen(false);
        setReassignNote('');
        fetchTaskDetails();
      }
    } catch (error) {
      console.error('Reassignment error:', error);
      alert(error.response?.data?.message || 'Failed to reassign task');
    } finally {
      setIsReassigning(false);
    }
  };

  if (loading) {
    return <Loader text="Fetching task details and audit logs..." />;
  }

  if (!task) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Task Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">The task you requested may have been deleted or archived.</p>
        <Link to="/tasks" className="text-blue-600 hover:underline text-xs font-bold">
          &larr; Back to tasks list
        </Link>
      </div>
    );
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
  const canManage = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Task Board</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <History className="w-4 h-4 text-blue-600" />
            <span>Audit Trail ({auditTrail.length})</span>
          </button>

          {canManage && (
            <button
              onClick={handleOpenReassign}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Reassign Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Task Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>

          {/* Status Transition Control */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-semibold">Change Status:</label>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">{task.title}</h1>

        {/* Description */}
        <div className="text-sm text-slate-700 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed">
          <p className="whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
        </div>

        {/* Task Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          {/* Assignee */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Assigned To
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shadow-sm">
                {task.assignedTo?.name?.charAt(0).toUpperCase() || 'E'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{task.assignedTo?.name || 'Unassigned'}</p>
                <p className="text-[11px] text-slate-500">{task.assignedTo?.email}</p>
              </div>
            </div>
          </div>

          {/* Assigned By */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Assigned By
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-xs shadow-sm">
                {task.assignedBy?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{task.assignedBy?.name || 'Manager'}</p>
                <p className="text-[11px] text-slate-500">{task.assignedBy?.email}</p>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Target Deadline
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            {isOverdue && <p className="text-[10px] text-rose-600 font-bold uppercase mt-1">Overdue Milestone</p>}
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Deliverables & Attachments ({task.attachments?.length || 0})
            </h3>
          </div>

          <label className="cursor-pointer px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Uploading...' : 'Attach File'}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>

        {task.attachments?.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">
            No files attached yet. Click "Attach File" to upload specifications, screenshots, or code archives.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {task.attachments.map((file) => (
              <div
                key={file._id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <Paperclip className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 truncate">{file.name}</span>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex-shrink-0"
                  title="Download / View Attachment"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discussion Thread */}
      <TaskComments
        comments={task.comments}
        onAddComment={handleAddComment}
        isSubmitting={isAddingComment}
      />

      {/* Audit History Timeline Modal */}
      <TaskHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        task={task}
      />

      {/* Reassign Task Modal */}
      <Modal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        title="Reassign Task to Employee"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReassignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select New Assignee *
            </label>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer"
              required
            >
              <option value="">-- Choose team member --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Handover Note / Reason
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Reassigning due to sprint reallocation..."
              value={reassignNote}
              onChange={(e) => setReassignNote(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsReassignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReassigning}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isReassigning ? 'Reassigning...' : 'Confirm Reassignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
