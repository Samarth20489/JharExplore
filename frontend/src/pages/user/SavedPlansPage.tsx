import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, IndianRupee, Trash2, Eye, Map, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';

const SavedPlansPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-plans'],
    queryFn: async () => { const res = await api.get('/planner/my-plans'); return res.data; },
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/planner/my-plans/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-plans'] }); toast.success('Plan deleted'); },
  });

  const bookmarkMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/planner/my-plans/${id}/bookmark`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-plans'] }),
  });

  const plans = data?.data || [];

  if (!isAuthenticated) {
    return (
      <>
        <Helmet><title>Saved Plans — JharExplore</title></Helmet>
        <section className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="text-center"><h2 className="font-heading text-2xl font-bold mb-4">Please Login</h2><Link to="/login" className="btn-primary">Login to View Plans</Link></div>
        </section>
      </>
    );
  }

  return (
    <>
      <Helmet><title>My Saved Plans — JharExplore</title></Helmet>

      <section className="pt-24 pb-8 px-4 bg-gradient-to-b from-dark to-primary/90 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">My Saved Plans</h1>
            <p className="text-white/70">All your AI-generated trip plans in one place.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20">
            <Map size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-heading text-2xl font-semibold mb-2">No saved plans yet</h3>
            <p className="text-gray-500 mb-6">Generate your first AI-powered trip plan!</p>
            <Link to="/dashboard/planner" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">Create a Trip Plan</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan: any, i: number) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all border border-gray-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-primary to-primary-light p-5 text-white">
                  <div className="flex items-start justify-between">
                    <h3 className="font-heading font-bold text-lg leading-tight flex-1 pr-2">{plan.title || 'Trip Plan'}</h3>
                    <button
                      onClick={() => bookmarkMutation.mutate(plan.id)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      {plan.is_bookmarked ? <BookmarkCheck size={20} className="fill-white" /> : <Bookmark size={20} />}
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {plan.prompt_used && (() => {
                    try {
                      const meta = JSON.parse(plan.prompt_used);
                      return (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {meta.location && <div className="flex items-center gap-1.5 text-gray-600"><MapPin size={14} className="text-primary" />{meta.location}</div>}
                          {meta.budget && <div className="flex items-center gap-1.5 text-gray-600"><IndianRupee size={14} className="text-primary" />{formatCurrency(meta.budget)}</div>}
                          {meta.days && <div className="flex items-center gap-1.5 text-gray-600"><Calendar size={14} className="text-primary" />{meta.days} days</div>}
                          {meta.travelers && <div className="flex items-center gap-1.5 text-gray-600"><Users size={14} className="text-primary" />{meta.travelers} travelers</div>}
                        </div>
                      );
                    } catch { return null; }
                  })()}

                  {plan.destinations?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {plan.destinations.slice(0, 4).map((d: string, j: number) => (
                        <span key={j} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-pill">{d}</span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400">Saved on {new Date(plan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>

                <div className="px-5 pb-5 flex gap-2">
                  <Link to={`/dashboard/plans/${plan.id}`} className="flex-1 text-center bg-primary text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
                    <Eye size={14} /> View Plan
                  </Link>
                  <button
                    onClick={() => { if (confirm('Delete this plan?')) deleteMutation.mutate(plan.id); }}
                    className="px-3 py-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default SavedPlansPage;
