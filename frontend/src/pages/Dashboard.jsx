import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../api';
import { StatCard } from '../components/common/StatCard';
import { Loader } from '../components/common/Loader';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { 
  Users, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  UserCheck, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsApi.getDashboardAnalytics();
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader text="Aggregating real-time workspace metrics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
              Workspace Overview
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Welcome back, <strong className="text-slate-800">{user?.name}</strong> • Real-time RBAC analytics and execution pipelines
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/tasks"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>{user?.role === 'employee' ? 'View My Assigned Tasks' : 'Manage Tasks & Sprints'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. ADMIN DASHBOARD */}
      {/* ------------------------------------------------------------- */}
      {user?.role === 'admin' && data && (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total System Users"
              value={data.usersByRole?.total || 0}
              icon={Users}
              color="purple"
              subtitle={`${data.usersByRole?.manager || 0} Managers, ${data.usersByRole?.employee || 0} Employees`}
            />
            <StatCard
              title="Total Tasks"
              value={data.tasksByStatus?.total || 0}
              icon={CheckSquare}
              color="indigo"
              subtitle={`${data.tasksByStatus?.['In Progress'] || 0} currently In Progress`}
            />
            <StatCard
              title="Completed Tasks"
              value={data.tasksByStatus?.Completed || 0}
              icon={TrendingUp}
              color="emerald"
              trend={{
                positive: true,
                value: `${Math.round(((data.tasksByStatus?.Completed || 0) / (data.tasksByStatus?.total || 1)) * 100)}% Rate`
              }}
            />
            <StatCard
              title="Overdue Tasks"
              value={data.overdueCount || 0}
              icon={AlertTriangle}
              color="rose"
              subtitle="Past target due date"
            />
          </div>

          {/* User Distribution & Task Status Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Status Progress */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>Task Pipeline Breakdown</span>
              </h3>
              <div className="space-y-4">
                {['Pending', 'In Progress', 'Completed', 'Rejected'].map((status) => {
                  const count = data.tasksByStatus?.[status] || 0;
                  const total = data.tasksByStatus?.total || 1;
                  const pct = Math.round((count / total) * 100);

                  const barColors = {
                    Pending: 'bg-amber-500',
                    'In Progress': 'bg-blue-500',
                    Completed: 'bg-emerald-500',
                    Rejected: 'bg-rose-500'
                  };

                  return (
                    <div key={status} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700 font-semibold">{status}</span>
                        <span className="text-slate-500 font-bold">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColors[status] || 'bg-blue-600'} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* User Breakdown by Role */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>User Role Allocation</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-xs">
                      ADM
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">System Administrators</p>
                      <p className="text-[11px] text-slate-500">Full system access</p>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-purple-700">{data.usersByRole?.admin || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
                      MGR
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Engineering Managers</p>
                      <p className="text-[11px] text-slate-500">Task delegators</p>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-blue-700">{data.usersByRole?.manager || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                      EMP
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Employees / Developers</p>
                      <p className="text-[11px] text-slate-500">MERN task executants</p>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-emerald-700">{data.usersByRole?.employee || 0}</span>
                </div>
              </div>
            </div>

            {/* Top Performing Team Members */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Top Completed Leaders</span>
              </h3>
              <div className="space-y-3">
                {data.topEmployees?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No completed tasks yet</p>
                ) : (
                  data.topEmployees?.map((emp, idx) => (
                    <div key={emp.email} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
                          {emp.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">{emp.name}</p>
                          <p className="text-[10px] text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        {emp.completedCount} done
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Audit Stream */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Live Audit Activity Stream (MongoDB Immutable Log)</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Real-time DB trail</span>
            </div>

            <div className="divide-y divide-slate-100">
              {data.recentActivities?.map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs">
                      {item.changedBy?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {item.changedBy?.name || 'System'}{' '}
                        <span className="font-normal text-slate-600">
                          {item.note || item.action.replace(/_/g, ' ')}
                        </span>
                      </p>
                      {item.taskId?.title && (
                        <p className="text-[11px] text-blue-600 font-medium truncate max-w-md">
                          Task: {item.taskId.title}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MANAGER DASHBOARD */}
      {/* ------------------------------------------------------------- */}
      {user?.role === 'manager' && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Team Assigned Tasks"
              value={data.tasksByStatus?.total || 0}
              icon={CheckSquare}
              color="indigo"
              subtitle="Tasks created by you"
            />
            <StatCard
              title="In Progress"
              value={data.tasksByStatus?.['In Progress'] || 0}
              icon={Clock}
              color="amber"
              subtitle="Active development"
            />
            <StatCard
              title="Completed"
              value={data.tasksByStatus?.Completed || 0}
              icon={TrendingUp}
              color="emerald"
              subtitle="Successfully verified"
            />
            <StatCard
              title="Overdue Tasks"
              value={data.overdueTasks || 0}
              icon={AlertTriangle}
              color="rose"
              subtitle="Past target due date"
            />
          </div>

          {/* Workload breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Employee Active Workload</span>
              </h3>

              <div className="space-y-3">
                {data.employeeWorkload?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">No active tasks assigned to team members.</p>
                ) : (
                  data.employeeWorkload?.map((emp) => (
                    <div key={emp.email} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
                          {emp.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{emp.name}</p>
                          <p className="text-[11px] text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                        {emp.activeTasks} active tasks
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Audit Activity */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Recent Team Activity</span>
              </h3>

              <div className="divide-y divide-slate-100">
                {data.recentActivities?.map((item) => (
                  <div key={item._id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-xs text-slate-700">
                        <span className="font-bold text-slate-900">{item.changedBy?.name}:</span> {item.note || item.action}
                      </p>
                      {item.taskId?.title && (
                        <p className="text-[11px] text-blue-600 font-medium truncate">{item.taskId.title}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. EMPLOYEE DASHBOARD */}
      {/* ------------------------------------------------------------- */}
      {user?.role === 'employee' && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="My Assigned Tasks"
              value={data.tasksByStatus?.total || 0}
              icon={CheckSquare}
              color="indigo"
              subtitle="All time assigned"
            />
            <StatCard
              title="In Progress"
              value={data.tasksByStatus?.['In Progress'] || 0}
              icon={Clock}
              color="amber"
              subtitle="Currently in development"
            />
            <StatCard
              title="Completed"
              value={data.tasksByStatus?.Completed || 0}
              icon={TrendingUp}
              color="emerald"
              subtitle="Done and verified"
            />
            <StatCard
              title="Overdue Tasks"
              value={data.overdueCount || 0}
              icon={AlertTriangle}
              color="rose"
              subtitle="Past target due date"
            />
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Upcoming Deadlines & Prioritized Deliverables</span>
            </h3>

            {data.upcomingTasks?.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center italic">No upcoming pending tasks! You are all caught up 🎉</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingTasks?.map((t) => {
                  const isOverdue = new Date(t.dueDate) < new Date();
                  return (
                    <div
                      key={t._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={t.priority} />
                          <StatusBadge status={t.status} />
                        </div>
                        <Link
                          to={`/tasks/${t._id}`}
                          className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                        >
                          {t.title}
                        </Link>
                        <p className="text-xs text-slate-500">
                          Assigned by: <span className="font-semibold text-slate-700">{t.assignedBy?.name}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-xs font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
                            Due: {new Date(t.dueDate).toLocaleDateString()}
                          </p>
                          {isOverdue && <span className="text-[10px] text-rose-600 font-bold uppercase">(Overdue)</span>}
                        </div>
                        <Link
                          to={`/tasks/${t._id}`}
                          className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-colors shadow-sm"
                        >
                          Update Progress
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
