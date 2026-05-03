import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Check, X, Trash2, Flag, AlertTriangle, MessageSquare, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../services/api';

const TABS = [
  { key: 'pending', label: 'Pending', color: 'amber' },
  { key: 'flagged', label: 'Flagged', color: 'red' },
  { key: 'approved', label: 'Approved', color: 'emerald' },
  { key: 'rejected', label: 'Rejected', color: 'gray' },
  { key: '', label: 'All', color: 'blue' },
];

const REJECT_REASONS = [
  'Spam or fake review', 'Inappropriate / offensive language', 'Unrelated to destination',
  'Personal attack', 'Misinformation', 'Other',
];

const AdminReviewsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', activeTab],
    queryFn: async () => { const res = await adminApi.get(`/admin/reviews?status=${activeTab}&limit=50`); return res.data; },
  });

  const reviews = data?.data || [];
  const total = data?.meta?.total || 0;

  const approveM = useMutation({
    mutationFn: async (id: string) => { await adminApi.patch(`/admin/reviews/${id}/approve`); },
    onSuccess: () => { toast.success('Review approved'); queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); },
  });

  const deleteM = useMutation({
    mutationFn: async (id: string) => { await adminApi.delete(`/admin/reviews/${id}`); },
    onSuccess: () => { toast.success('Review deleted'); queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); },
  });

  const flagM = useMutation({
    mutationFn: async (id: string) => { await adminApi.patch(`/admin/reviews/${id}/flag`); },
    onSuccess: () => { toast.success('Flag toggled'); queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); },
  });

  const rejectM = useMutation({
    mutationFn: async ({ id, reason, note }: { id: string; reason: string; note: string }) => {
      await adminApi.patch(`/admin/reviews/${id}/reject`, { rejection_reason: reason, rejection_note: note });
    },
    onSuccess: () => { toast.success('Review rejected'); setRejectModal(null); setRejectReason(''); setRejectNote(''); queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); },
  });

  return (
    <>
      <Helmet><title>Review Moderation — JharExplore Admin</title></Helmet>
      <div className="space-y-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1><p className="text-sm text-gray-500 mt-1">Manage and moderate user reviews</p></div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? `bg-${tab.color}-100 text-${tab.color}-700 ring-1 ring-${tab.color}-200` : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Review Cards */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No reviews in this category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review: any, i: number) => (
              <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-colors ${review.is_flagged ? 'border-l-4 border-l-red-400 border-gray-100' : review.rejection_reason ? 'border-gray-200 bg-gray-50' : 'border-gray-100'}`}>

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{review.users?.full_name?.[0] || '?'}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{review.users?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{review.users?.email} · {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {review.target_type === 'place' ? '📍' : '🏨'} {review.target_type}
                    </span>
                    <div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className={s <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-200'} />)}</div>
                    {review.is_flagged && <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full">⚠ Flagged</span>}
                    {review.is_edited && <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">Edited</span>}
                  </div>
                </div>

                {/* Content */}
                {review.title && <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>}
                {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}

                {review.rejection_reason && (
                  <div className="mt-2 p-2 bg-red-50 rounded-lg text-xs text-red-600">
                    <strong>Rejected:</strong> {review.rejection_reason}
                    {review.rejection_note && <span className="block text-red-400 mt-0.5">Note: {review.rejection_note}</span>}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  {!review.is_approved && !review.rejection_reason && (
                    <button onClick={() => approveM.mutate(review.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors">
                      <Check size={13} /> Approve
                    </button>
                  )}
                  {!review.rejection_reason && (
                    <button onClick={() => { setRejectModal(review); setRejectReason(''); setRejectNote(''); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors">
                      <X size={13} /> Reject
                    </button>
                  )}
                  <button onClick={() => flagM.mutate(review.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${review.is_flagged ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                    <Flag size={13} /> {review.is_flagged ? 'Unflag' : 'Flag'}
                  </button>
                  <button onClick={() => { if (confirm('Permanently delete this review?')) deleteM.mutate(review.id); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors ml-auto">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">❌ Reject Review</h3>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Rejection Reason *</label>
              <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30">
                <option value="">Select reason...</option>
                {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Internal Note (optional)</label>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={2} placeholder="Admin-only note..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none" />
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setRejectModal(null)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
              <button onClick={() => rejectM.mutate({ id: rejectModal.id, reason: rejectReason, note: rejectNote })} disabled={!rejectReason || rejectM.isPending}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed">
                {rejectM.isPending ? 'Rejecting...' : 'Reject Review'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AdminReviewsPage;
