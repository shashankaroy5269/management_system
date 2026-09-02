import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api';
import { UserTable } from '../components/users/UserTable';
import { UserModal } from '../components/users/UserModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Loader, EmptyState } from '../components/common/Loader';
import { Search, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';

export const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search,
        role: roleFilter,
        status: statusFilter
      };
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);

      const res = await userApi.getUsers(params);
      if (res.data?.success) {
        setUsers(res.data.data.data || []);
        setPagination(res.data.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [search, roleFilter, statusFilter]);

  // Handle Create or Update User
  const handleSaveUser = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await userApi.updateUser(editingUser._id, formData);
      } else {
        await userApi.createUser(formData);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers(pagination.page);
    } catch (error) {
      console.error('User save error:', error);
      alert(error.response?.data?.message || 'Error saving user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle user status (Active / Inactive)
  const handleToggleStatus = async (targetUser) => {
    try {
      const res = await userApi.toggleUserStatus(targetUser._id);
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === targetUser._id ? { ...u, status: res.data.data.status } : u
          )
        );
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      alert(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  // Soft delete user
  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userApi.deleteUser(userToDelete._id);
      setIsDeleteOpen(false);
      setUserToDelete(null);
      fetchUsers(pagination.page);
    } catch (error) {
      console.error('Delete user error:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Team Members Directory</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {isAdmin
              ? 'Manage user accounts, RBAC permissions, and team activation status'
              : 'Browse active team members, contact info, and roles'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Role Filter (Admin only) */}
          {isAdmin ? (
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="admin">Admins</option>
                <option value="manager">Managers</option>
                <option value="employee">Employees</option>
              </select>
            </div>
          ) : (
            <div />
          )}

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <Loader text="Loading directory..." />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          subtitle="Try modifying your search query or filter parameters."
        />
      ) : (
        <UserTable
          users={users}
          onEditUser={(u) => {
            setEditingUser(u);
            setIsModalOpen(true);
          }}
          onToggleStatus={handleToggleStatus}
          onDeleteUser={(u) => {
            setUserToDelete(u);
            setIsDeleteOpen(true);
          }}
          currentUserRole={currentUser?.role}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-bold text-slate-900">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-slate-900">{pagination.total}</span> users
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-700 font-bold px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchUsers(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* User Create/Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleSaveUser}
        user={editingUser}
        isLoading={isSubmitting}
      />

      {/* Soft Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteUserConfirm}
        title="Soft Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This will mark their account as deleted while preserving historical audit records.`}
        confirmText="Yes, Soft Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
