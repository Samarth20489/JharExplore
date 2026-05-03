import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Shield, Ban, CheckCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../services/api';

const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => { const res = await adminApi.get('/admin/users'); return res.data.data; },
  });

  const suspendM = useMutation({
    mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) => {
      if (suspend) await adminApi.patch(`/admin/users/${id}/suspend`, { reason: 'Admin action' });
      else await adminApi.patch(`/admin/users/${id}/reactivate`);
    },
    onSuccess: () => { toast.success('User status updated'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: () => toast.error('Failed to update user'),
  });

  const users = (usersData || []).filter((u: any) => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Helmet><title>Users — JharExplore Admin</title></Helmet>
      <div className="space-y-4">
        <div><h1 className="text-2xl font-bold text-gray-900">User Management</h1><p className="text-sm text-gray-500 mt-1">{users.length} registered users</p></div>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="max-w-md w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td></tr> :
               users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">{user.full_name?.[0] || '?'}</div><span className="font-medium text-gray-900">{user.full_name || 'N/A'}</span></div></td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">{new Date(user.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${user.is_suspended ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{user.is_suspended ? '🚫 Suspended' : '✅ Active'}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => suspendM.mutate({ id: user.id, suspend: !user.is_suspended })} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${user.is_suspended ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                      {user.is_suspended ? 'Reactivate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminUsersPage;
