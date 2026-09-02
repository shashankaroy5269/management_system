import React from 'react';
import { RoleBadge } from '../common/Badge';
import { Edit2, Trash2, Power, Phone } from 'lucide-react';

export const UserTable = ({
  users,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
  currentUserRole
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th scope="col" className="px-5 py-3.5">User</th>
              <th scope="col" className="px-5 py-3.5">Role</th>
              <th scope="col" className="px-5 py-3.5">Status</th>
              <th scope="col" className="px-5 py-3.5">Contact</th>
              <th scope="col" className="px-5 py-3.5">Joined Date</th>
              {currentUserRole === 'admin' && (
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const isActive = u.status === 'active';
              return (
                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-sm shadow-sm">
                        {u.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <RoleBadge role={u.role} />
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {u.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-xs text-slate-600">
                    <div className="space-y-1">
                      {u.phone ? (
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No phone set</span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                    {new Date(u.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>

                  {currentUserRole === 'admin' && (
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Active / Inactive */}
                        <button
                          onClick={() => onToggleStatus(u)}
                          title={isActive ? 'Deactivate User' : 'Activate User'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isActive
                              ? 'text-slate-500 hover:text-amber-600 border-slate-200 hover:bg-slate-100'
                              : 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {/* Edit User */}
                        <button
                          onClick={() => onEditUser(u)}
                          title="Edit User"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Soft Delete */}
                        <button
                          onClick={() => onDeleteUser(u)}
                          title="Delete User"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
