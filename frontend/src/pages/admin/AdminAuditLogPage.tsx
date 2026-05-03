import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import { adminApi } from '../../services/api';

const ACTION_ICONS: Record<string, string> = {
  'review.approve': '✅', 'review.reject': '❌', 'review.delete': '🗑', 'review.flag': '🚩',
  'user.suspend': '🚫', 'user.reactivate': '♻️',
  'place.create': '📍', 'place.update': '✏️', 'place.delete': '🗑',
  'hotel.create': '🏨', 'hotel.update': '✏️', 'hotel.delete': '🗑',
};

const AdminAuditLogPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-log'],
    queryFn: async () => { const res = await adminApi.get('/admin/audit-log?limit=100'); return res.data.data; },
  });

  const logs = data || [];

  return (
    <>
      <Helmet><title>Audit Log — JharExplore Admin</title></Helmet>
      <div className="space-y-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Audit Log</h1><p className="text-sm text-gray-500 mt-1">Complete history of admin actions</p></div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {isLoading ? <div className="text-center py-12 text-gray-400">Loading...</div> :
           logs.length === 0 ? <div className="text-center py-12 text-gray-400"><ClipboardList size={32} className="mx-auto mb-2 text-gray-200" />No audit entries yet</div> : (
            <div className="divide-y divide-gray-50">
              {logs.map((log: any, i: number) => (
                <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm shrink-0">{ACTION_ICONS[log.action] || '📝'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">{log.actor_name || 'System'}</span>
                      <span className="text-gray-400 mx-1.5">·</span>
                      <span className="font-medium">{log.action}</span>
                      {log.entity_name && <span className="text-gray-500"> — {log.entity_name}</span>}
                    </p>
                    {log.entity_type && <p className="text-xs text-gray-400 mt-0.5">Entity: {log.entity_type} · ID: {log.entity_id?.slice(0, 8)}</p>}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminAuditLogPage;
