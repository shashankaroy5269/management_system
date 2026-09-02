import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api';
import { RoleBadge } from '../components/common/Badge';
import { User, Mail, Phone, Shield, Save, CheckCircle2 } from 'lucide-react';

export const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await userApi.updateUser(user.id || user._id, formData);
      if (res.data?.success) {
        updateUserProfile(res.data.data.user);
        setSuccessMsg('Profile updated successfully!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200/80">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Manage your personal contact info and review role capabilities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Profile Summary Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-black text-3xl shadow-sm mx-auto">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
          </div>

          <div className="pt-1">
            <RoleBadge role={user?.role} />
          </div>

          <div className="pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Account Status:</span>
              <span className="text-emerald-700 font-bold capitalize bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {user?.status || 'active'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Access Level:</span>
              <span className="text-slate-800 font-bold uppercase">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Right: Profile Edit Form & Permissions breakdown */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Edit Personal Information</h3>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address (Verified & Immutable)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdating ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Role Capabilities Guide (Interview Talking Point) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Role Privilege Specifications ({user?.role?.toUpperCase()})</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              {user?.role === 'admin' && (
                <>
                  <li>Complete administrative control over all system user accounts (create, activate, soft delete).</li>
                  <li>Global visibility into all company tasks, assignees, and deadlines.</li>
                  <li>Access to high-level company productivity aggregation metrics and audit streams.</li>
                </>
              )}
              {user?.role === 'manager' && (
                <>
                  <li>Ability to create and delegate tasks to team members (employees).</li>
                  <li>Reassign tasks, change priorities, and update project deadlines.</li>
                  <li>Access to team productivity metrics and individual employee workloads.</li>
                </>
              )}
              {user?.role === 'employee' && (
                <>
                  <li>Access restricted strictly to tasks assigned directly to your account.</li>
                  <li>Update task workflow state (Pending &rarr; In Progress &rarr; Completed / Rejected).</li>
                  <li>Upload task deliverables/attachments and participate in task discussion threads.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
