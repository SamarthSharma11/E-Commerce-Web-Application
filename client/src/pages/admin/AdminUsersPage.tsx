import React, { useEffect, useState } from 'react';
import { Search, Shield, ShieldOff, UserCheck, UserX } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import type { PaginationMeta } from '../../types';

// =====================================================
// Admin Users Page — White Canvas
// =====================================================
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: string;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '10');
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (search) params.set('search', search);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch users';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'customer' | 'admin') => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update role';
      toast.error(message);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      setUsers(users.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u)));
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update status';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal tracking-[-0.05em] text-[#000000]">Users Management</h1>
        <p className="text-[#787574] text-[14px] mt-1">Manage user accounts and permissions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787574]" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] placeholder-[#787574] focus:outline-none shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px]"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] focus:outline-none shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border-none rounded-[28px] overflow-hidden shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#000000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#787574] text-[14px]">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-[#787574] text-[14px]">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] text-left">
              <thead className="bg-[#f2f4f5] text-[#787574] uppercase text-[12px]">
                <tr>
                  <th className="px-6 py-4 font-normal">User</th>
                  <th className="px-6 py-4 font-normal">Email</th>
                  <th className="px-6 py-4 font-normal">Role</th>
                  <th className="px-6 py-4 font-normal">Status</th>
                  <th className="px-6 py-4 font-normal">Joined</th>
                  <th className="px-6 py-4 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb]">
                {users.map((user, idx) => (
                  <tr
                    key={user._id}
                    className="hover:bg-[#f2f4f5]/60 transition-colors animate-table-row"
                    style={{ '--row-delay': `${Math.min(idx * 30, 200)}ms` } as React.CSSProperties}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#f2f4f5] border border-[#ebebeb] flex items-center justify-center text-[#000000] font-normal text-[12px]">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-normal text-[#000000]">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#787574]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[12px] font-normal border ${
                        user.role === 'admin'
                          ? 'bg-[#f2f4f5] text-[#000000] border-[#ebebeb]'
                          : 'bg-[#f2f4f5] text-[#787574] border-[#ebebeb]'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[12px] font-normal border ${
                        user.isActive
                          ? 'bg-[#000000] text-white border-[#000000]'
                          : 'bg-[#f2f4f5] text-[#787574] border-[#ebebeb]'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#787574] text-[12px]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'customer' : 'admin')}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f2f4f5] text-[#787574] hover:text-[#000000] transition-colors cursor-pointer"
                          title={user.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
                        >
                          {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleStatusToggle(user._id, user.isActive)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f2f4f5] text-[#787574] hover:text-[#000000] transition-colors cursor-pointer"
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#ebebeb]">
            <p className="text-[12px] text-[#787574]">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full bg-white border border-[#ebebeb] hover:border-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-[14px]"
              >
                ←
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full text-[12px] font-normal transition-all cursor-pointer ${
                    currentPage === page ? 'bg-[#000000] text-white border-none' : 'bg-white border border-[#ebebeb] hover:border-[#000000] text-[#000000]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination!.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="w-8 h-8 rounded-full bg-white border border-[#ebebeb] hover:border-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-[14px]"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
