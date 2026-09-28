import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, ShieldCheck, UserCheck, Layers, ArrowRight } from 'lucide-react';

const Landing = () => {
  const token = localStorage.getItem('token');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-white flex flex-col justify-between">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-12 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4" />
          <span>Role-Based Access Control Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Enterprise MERN Task Management <br />
          <span className="text-blue-600">Tailored by User Roles</span>
        </h1>

        <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A clean, efficient, and role-driven task execution platform built for Admins, Managers, and Employees with granular access permissions.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {token ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
              >
                <span>Sign In to System</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Role Highlight Cards */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Administrator</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Full system control. Create, edit, and delete any task, manage users, and toggle account activation.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
            <li>✓ Full Task CRUD & Deletion</li>
            <li>✓ User Status Management</li>
            <li>✓ System Metrics & Oversight</li>
          </ul>
        </div>

        {/* Manager Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Project Manager</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Assign tasks to employees, monitor progress, update task specifications, and organize pipelines.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
            <li>✓ Create & Assign Tasks</li>
            <li>✓ Edit Task Deadlines</li>
            <li>✓ Monitor Team Velocity</li>
          </ul>
        </div>

        {/* Employee Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Employee</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Focus strictly on your assigned tasks. Update statuses from Pending to In Progress and Completed.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
            <li>✓ Isolated Task View</li>
            <li>✓ 1-Click Status Transitions</li>
            <li>✓ Clean Distraction-Free Flow</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        TaskFlow RBAC Management System • Developed with MongoDB, Express, React, and Node.js
      </footer>
    </div>
  );
};

export default Landing;
