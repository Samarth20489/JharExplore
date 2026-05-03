import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../services/api';

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const AdminAnnouncementsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ message: '', type: 'info', link_url: '', link_label: '', expires_at: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => { const res = await adminApi.get('/admin/announcements'); return res.data.data; },
  });

  const createM = useMutation({
    mutationFn: async () => { await adminApi.post('/admin/announcements', form); },
    onSuccess: () => { toast.success('Announcement created'); setShowAdd(false); setForm({ message: '', type: 'info', link_url: '', link_label: '', expires_at: '' }); queryClient.invalidateQueries({ queryKey: ['admin-announcements'] }); },
    onError: () => toast.error('Failed to create'),
  });

  const toggleM = useMutation({
    mutationFn: async (id: string) => { await adminApi.patch(`/admin/announcements/${id}/toggle`); },
    onSuccess: () => { toast.success('Toggled'); queryClient.invalidateQueries({ queryKey: ['admin-announcements'] }); },
  });

  const deleteM = useMutation({
    mutationFn: async (id: string) => { await adminApi.delete(`/admin/announcements/${id}`); },
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['admin-announcements'] }); },
  });

  const announcements = data || [];

  return (
    <>
      <Helmet><title>Announcements — JharExplore Admin</title></Helmet>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Announcements</h1><p className="text-sm text-gray-500 mt-1">Site-wide banners visible to all visitors</p></div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-sm"><Plus size={16} /> New Announcement</button>
        </div>

        {isLoading ? <div className="text-center py-12 text-gray-400">Loading...</div> :
         announcements.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"><Megaphone size={40} className="text-gray-200 mx-auto mb-3" /><p className="text-gray-400">No announcements yet</p></div>
        ) : (
          <div className="space-y-3">
            {announcements.map((ann: any) => (
              <div key={ann.id} className={`rounded-2xl p-5 border shadow-sm ${ann.is_active ? TYPE_COLORS[ann.type] || TYPE_COLORS.info : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{ann.message}</p>
                    {ann.link_url && <a href={ann.link_url} target="_blank" className="text-xs underline mt-1 inline-block">{ann.link_label || ann.link_url}</a>}
                    <p className="text-xs opacity-60 mt-2">Created: {new Date(ann.created_at).toLocaleDateString('en-IN')} {ann.expires_at && `· Expires: ${new Date(ann.expires_at).toLocaleDateString('en-IN')}`}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleM.mutate(ann.id)} title={ann.is_active ? 'Deactivate' : 'Activate'}>{ann.is_active ? <ToggleRight size={24} className="text-emerald-600" /> : <ToggleLeft size={24} className="text-gray-400" />}</button>
                    <button onClick={() => { if (confirm('Delete?')) deleteM.mutate(ann.id); }} className="p-1.5 hover:bg-white/50 rounded-lg"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-gray-900">New Announcement</h3><button onClick={() => setShowAdd(false)}><X size={18} className="text-gray-400" /></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Message *</label><textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none" /></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Type</label><select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none"><option value="info">Info (blue)</option><option value="warning">Warning (amber)</option><option value="success">Success (green)</option></select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Link URL</label><input value={form.link_url} onChange={e => setForm(f => ({...f, link_url: e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
                <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Link Label</label><input value={form.link_label} onChange={e => setForm(f => ({...f, link_label: e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Expires At</label><input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({...f, expires_at: e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
            </div>
            {/* Live Preview */}
            {form.message && (
              <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${TYPE_COLORS[form.type] || TYPE_COLORS.info}`}>
                📢 {form.message} {form.link_label && <span className="underline ml-1">{form.link_label}</span>}
              </div>
            )}
            <div className="flex items-center justify-end gap-3 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
              <button onClick={() => createM.mutate()} disabled={!form.message || createM.isPending} className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">{createM.isPending ? 'Creating...' : 'Publish'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AdminAnnouncementsPage;
