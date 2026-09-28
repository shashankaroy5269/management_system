import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import AxiosInstance from '../api/axios';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { PlusCircle, Search, Edit3, Trash2, Calendar, User, CheckCircle2 } from 'lucide-react';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchTasks();
  }, [currentPage, statusFilter, priorityFilter]);

  const fetchTasks = async (querySearch = search) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
      };
      if (querySearch) params.search = querySearch;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const response = await AxiosInstance.get('/tasks', { params });
      if (response.data.success) {
        setTasks(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Could not fetch tasks',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTasks(search);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await AxiosInstance.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Task marked as ${newStatus}`,
          timer: 1200,
          showConfirmButton: false,
        });

        // Update local state smoothly
        setTasks(
          tasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Status Update Failed',
        text: error.response?.data?.message || 'Permission denied',
      });
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    const result = await Swal.fire({
      title: 'Delete Task?',
      text: `Are you sure you want to remove "${taskTitle}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await AxiosInstance.delete(`/tasks/${taskId}`);
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Task has been deleted successfully',
          timer: 1500,
          showConfirmButton: false,
        });
        setTasks(tasks.filter((t) => t._id !== taskId));
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error.response?.data?.message || 'Could not delete task',
      });
    }
  };

  const canCreate = ['Admin', 'Manager'].includes(user?.role);
  const canDelete = user?.role === 'Admin';
  const canEdit = ['Admin', 'Manager'].includes(user?.role);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
          <p className="text-sm text-slate-500">
            {user?.role === 'Employee'
              ? 'View and update your personal task queue'
              : 'Monitor, assign, and organize team tasks'}
          </p>
        </div>

        {canCreate && (
          <Link
            to="/tasks/add"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Task</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <Loader text="Fetching task list..." />
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No tasks found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Task Details
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50 transition">
                    {/* Title & Description */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-900 text-sm">{task.title}</div>
                      {task.description && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{task.description}</p>
                      )}
                    </td>

                    {/* Assigned To */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                          {task.assignedTo?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm text-slate-700">
                          {task.assignedTo?.name || (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusBadge(
                          task.status
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                      {task.dueDate ? (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">No deadline</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      {canEdit && (
                        <Link
                          to={`/tasks/edit/${task._id}`}
                          title="Edit Task"
                          className="inline-block p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteTask(task._id, task.title)}
                          title="Delete Task"
                          className="inline-block p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default TaskList;
