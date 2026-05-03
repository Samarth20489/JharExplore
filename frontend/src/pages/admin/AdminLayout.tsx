import React, { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MapPin, Map, Building2, MessageSquare, Users, Image, CheckCircle2,
  ClipboardList, Megaphone, LogOut, ChevronLeft, ChevronRight, Menu, X, Gem, Shield
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { adminApi } from '../../services/api';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Places', icon: MapPin, href: '/admin/places', badgeKey: 'total_places' },
      { label: 'Hotels', icon: Building2, href: '/admin/hotels', badgeKey: 'total_hotels' },
    ],
  },
  {
    label: 'Moderation',
    items: [
      { label: 'Reviews', icon: MessageSquare, href: '/admin/reviews', badgeKey: 'pending_reviews', badgeColor: 'amber' },
      { label: 'Announcements', icon: Megaphone, href: '/admin/announcements' },
    ],
  },
  {
    label: 'Users',
    items: [
      { label: 'All Users', icon: Users, href: '/admin/users' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Content Health', icon: CheckCircle2, href: '/admin/content-health' },
      { label: 'Audit Log', icon: ClipboardList, href: '/admin/audit-log' },
    ],
  },
];

const AdminLayout: React.FC = () => {
  const { admin, isAdminAuthenticated, clearAdmin } = useAdminStore();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['admin-sidebar-stats'],
    queryFn: async () => { const res = await adminApi.get('/admin/dashboard/stats'); return res.data.data; },
    enabled: isAdminAuthenticated,
    staleTime: 60000,
    refetchInterval: 60000,
  });

  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />;

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-64';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-800 shrink-0">
        <Shield size={28} className="text-emerald-400 shrink-0" />
        {!collapsed && <span className="font-heading font-bold text-white text-lg">JharAdmin</span>}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">{group.label}</p>}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = location.pathname === item.href || (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));
                const badge = item.badgeKey && stats?.[item.badgeKey];
                return (
                  <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive ? 'bg-emerald-500/15 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    <item.icon size={18} className={`shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {badge !== undefined && badge > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor === 'amber' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{badge}</span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin Profile + Logout */}
      <div className="border-t border-gray-800 p-3 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">{admin?.username?.[0]?.toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{admin?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={clearAdmin} className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5"><LogOut size={16} /></button>
          </div>
        ) : (
          <button onClick={clearAdmin} className="w-full flex justify-center p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5"><LogOut size={18} /></button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col ${sidebarWidth} bg-gray-900 transition-all duration-300 shrink-0 relative`}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 text-gray-400 flex items-center justify-center hover:text-white z-10">
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 z-50 lg:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg"><Menu size={20} /></button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Welcome,</span>
            <span className="text-sm font-semibold text-gray-800">{admin?.username}</span>
          </div>
          <Link to="/" target="_blank" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">View Site →</Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
