import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskApi } from '../api';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskTable } from '../components/tasks/TaskTable';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskHistoryModal } from '../components/tasks/TaskHistoryModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Loader, EmptyState } from '../components/common/Loader';
import { Plus, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';

export const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    overdue: ''
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: viewMode === 'table' ? 10 : 9,
        ...filters
      };
      // Clean empty keys
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);

      const res = await taskApi.getTasks(params);
      if (res.data?.success) {
        setTasks(res.data.data.data || []);
        setPagination(res.data.data.pagination || { page: 1, limit: 9, total: 0, totalPages: 1 });
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(1);
  }, [filters, viewMode]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '', status: '', priority: '', overdue: '' });
  };

  // Quick status transition
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskApi.changeStatus(taskId, { status: newStatus });
      if (res.data?.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (error) {
      console.error('Failed to change status:', error);
      alert(error.response?.data?.message || 'Failed to update task status');
    }
  };

  // Create or Update task
  const handleSaveTask = async (formData) => {
    setIsSubmittingTask(true);
    try {
      if (editingTask) {
        await taskApi.updateTask(editingTask._id, formData);
      } else {
        await taskApi.createTask(formData);
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      fetchTasks(pagination.page);
    } catch (error) {
      console.error('Failed to save task:', error);
      alert(error.response?.data?.message || 'Error creating/updating task');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Delete task
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await taskApi.deleteTask(taskToDelete._id);
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
      fetchTasks(pagination.page);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const canManageTasks = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {user?.role === 'employee' ? 'My Assigned Tasks' : 'Task & Sprint Management'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {user?.role === 'employee'
              ? 'Track development status, review deliverables, and collaborate'
              : 'Create, delegate, and monitor workflows across team members'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'grid' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Create Task Button */}
          {canManageTasks && (
            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <TaskFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Main Content */}
      {loading ? (
        <Loader text="Loading tasks from database..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks match your criteria"
          subtitle="Try broadening your filters or create a new task to get started."
          action={
            canManageTasks && (
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Create Task
              </button>
            )
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              onOpenHistory={(t) => {
                setSelectedTaskForHistory(t);
                setIsHistoryModalOpen(true);
              }}
              userRole={user?.role}
            />
          ))}
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onOpenHistory={(t) => {
            setSelectedTaskForHistory(t);
            setIsHistoryModalOpen(true);
          }}
          onEditTask={(t) => {
            setEditingTask(t);
            setIsTaskModalOpen(true);
          }}
          onDeleteTask={(t) => {
            setTaskToDelete(t);
            setIsDeleteDialogOpen(true);
          }}
          userRole={user?.role}
        />
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-bold text-slate-900">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-slate-900">{pagination.total}</span> tasks
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTasks(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-700 font-bold px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchTasks(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        task={editingTask}
        isLoading={isSubmittingTask}
      />

      {/* Audit History Timeline Modal */}
      <TaskHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedTaskForHistory(null);
        }}
        task={selectedTaskForHistory}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This will soft delete the task from the board.`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
