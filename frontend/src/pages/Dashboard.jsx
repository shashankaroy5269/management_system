import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AxiosInstance from '../api/axios';
import Loader from '../components/Loader';
import { CheckCircle2, Clock, ListTodo, PlusCircle, AlertCircle, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    recentTasks: [],
  });
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await AxiosInstance.get('/tasks/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <Loader text="Loading your dashboard..." />;

  const canCreateTask = ['Admin', 'Manager'].includes(user?.role);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome back, {user?.name}! 👋
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {user?.role === 'Employee'
              ? 'Here is an overview of the tasks assigned specifically to you.'
              : `You are signed in as ${user?.role}. Oversee team tasks and operations.`}
          </p>
        </div>

        {canCreateTask && (
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <Link
              to="/tasks/add"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Task</span>
            </Link>
          </div>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Tasks</span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{stats.totalTasks}</p>
          <span className="text-xs text-slate-400 mt-1 inline-block">Active pipeline count</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Pending Tasks</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-600">{stats.pendingTasks}</p>
          <span className="text-xs text-slate-400 mt-1 inline-block">Awaiting start</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">In Progress</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-blue-600">{stats.inProgressTasks}</p>
          <span className="text-xs text-slate-400 mt-1 inline-block">Under development</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Completed</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-600">{stats.completedTasks}</p>
          <span className="text-xs text-slate-400 mt-1 inline-block">Successfully delivered</span>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Tasks</h2>
            <p className="text-xs text-slate-500">Recently updated workflow items</p>
          </div>
          <Link
            to="/tasks"
            className="inline-flex items-center space-x-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {stats.recentTasks?.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No tasks found. {canCreateTask ? 'Click "Create Task" to add the first task.' : ''}
            </div>
          ) : (
            stats.recentTasks?.map((task) => (
              <div
                key={task._id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900">{task.title}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Assigned to:{' '}
                    <span className="font-medium text-slate-700">
                      {task.assignedTo?.name || 'Unassigned'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                  <Link
                    to="/tasks"
                    className="text-xs font-semibold text-slate-600 hover:text-blue-600"
                  >
                    Manage &rarr;
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
