import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin, Building2, MessageSquare, Users, Plus, Hotel, Eye, ClipboardList,
  CheckCircle2, AlertTriangle, ArrowRight, TrendingUp
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { useAdminStore } from '../../store/adminStore';

const AdminDashboard: React.FC = () => {
  const { isAdminAuthenticated } = useAdminStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const res = await adminApi.get('/admin/dashboard/stats'); return res.data.data; },
    enabled: isAdminAuthenticated,
  });

  const { data: auditData } = useQuery({
    queryKey: ['admin-audit-recent'],
    queryFn: async () => { const res = await adminApi.get('/admin/audit-log?limit=8'); return res.data.data; },
    enabled: isAdminAuthenticated,
  });

  const statCards = [
    { label: 'Total Places', value: stats?.total_places || 0, icon: MapPin, color: 'from-emerald-500 to-emerald-600', sub: 'across 24 districts', href: '/admin/places' },
    { label: 'Total Hotels', value: stats?.total_hotels || 0, icon: Building2, color: 'from-blue-500 to-blue-600', sub: 'active listings', href: '/admin/hotels' },
    { label: 'Pending Reviews', value: stats?.pending_reviews || 0, icon: MessageSquare, color: 'from-amber-500 to-amber-600', sub: 'awaiting moderation', href: '/admin/reviews', urgent: (stats?.pending_reviews || 0) > 5 },
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'from-purple-500 to-purple-600', sub: 'registered users', href: '/admin/users' },
  ];

  const quickActions = [
    { label: 'Add New Place', icon: Plus, href: '/admin/places', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
    { label: 'Add New Hotel', icon: Hotel, href: '/admin/hotels', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { label: 'Review Queue', icon: Eye, href: '/admin/reviews', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
    { label: 'Manage Users', icon: Users, href: '/admin/users', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
    { label: 'Content Health', icon: CheckCircle2, href: '/admin/content-health', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
    { label: 'Audit Log', icon: ClipboardList, href: '/admin/audit-log', color: 'bg-gray-50 text-gray-600 hover:bg-gray-100' },
  ];

  const ch = stats?.content_health;

  const healthItems = ch ? [
    { label: 'Places with coordinates', pct: ch.coords_complete_pct },
    { label: 'Places with How to Reach', pct: ch.how_to_reach_pct },
    { label: 'Places with gallery images', pct: ch.gallery_complete_pct },
    { label: 'Hotels with coordinates', pct: ch.hotel_coords_pct },
    { label: 'Hotels with gallery images', pct: ch.hotel_gallery_pct },
  ] : [];

  const actionLabels: Record<string, string> = {
    'review.approve': '✅ Approved review', 'review.reject': '❌ Rejected review', 'review.delete': '🗑 Deleted review',
    'user.suspend': '🚫 Suspended user', 'user.reactivate': '✅ Reactivated user',
    'place.create': '📍 Created place', 'place.update': '✏️ Updated place', 'place.delete': '🗑 Deleted place',
    'hotel.create': '🏨 Created hotel', 'hotel.update': '✏️ Updated hotel', 'hotel.delete': '🗑 Deleted hotel',
  };

  return (
    <>
      <Helmet><title>Admin Dashboard — JharExplore</title></Helmet>

      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your tourism portal</p>
        </div>

        {/* Row 1: Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={card.href} className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? '—' : card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                    <card.icon size={20} className="text-white" />
                  </div>
                </div>
                {card.urgent && <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full animate-pulse">⚠ Needs attention</span>}
                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400 group-hover:text-emerald-500 transition-colors">
                  <span>View details</span><ArrowRight size={12} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Row 2: Quick Actions + Content Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" id="quick-actions">
            <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map(action => (
                <Link key={action.label} to={action.href}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all ${action.color}`}>
                  <action.icon size={22} />
                  <span className="text-xs font-semibold">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Content Health */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">📊 Content Health</h2>
              <Link to="/admin/content-health" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Details →</Link>
            </div>
            {healthItems.length > 0 ? (
              <div className="space-y-3">
                {healthItems.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className={`text-sm font-bold ${item.pct >= 80 ? 'text-emerald-600' : item.pct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${item.pct >= 80 ? 'bg-emerald-500' : item.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">Loading health data...</div>
            )}
          </motion.div>
        </div>

        {/* Row 3: Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">📋 Recent Activity</h2>
            <Link to="/admin/audit-log" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">View All →</Link>
          </div>
          {auditData && auditData.length > 0 ? (
            <div className="space-y-3">
              {auditData.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs shrink-0">
                    {log.actor_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{log.actor_name || 'System'}</span>{' '}
                      {actionLabels[log.action] || log.action}
                      {log.entity_name && <> — <span className="font-medium text-gray-900">{log.entity_name}</span></>}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default AdminDashboard;
