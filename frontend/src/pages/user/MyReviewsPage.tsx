import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Trash2, MessageCircle, MapPin, Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const MyReviewsPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: async () => { const res = await api.get('/feedback/my-reviews'); return res.data; },
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/feedback/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-reviews'] }); toast.success('Review deleted'); },
  });

  const reviews = data?.data || [];

  if (!isAuthenticated) {
    return (
      <>
        <Helmet><title>My Reviews — JharExplore</title></Helmet>
        <section className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="text-center"><h2 className="font-heading text-2xl font-bold mb-4">Please Login</h2><Link to="/login" className="btn-primary">Login to View Reviews</Link></div>
        </section>
      </>
    );
  }

  return (
    <>
      <Helmet><title>My Reviews — JharExplore</title></Helmet>

      <section className="pt-24 pb-8 px-4 bg-gradient-to-b from-dark to-primary/90 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">My Reviews</h1>
            <p className="text-white/70">Reviews you have written about destinations and hotels.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-heading text-2xl font-semibold mb-2">You haven't written any reviews yet</h3>
            <p className="text-gray-500 mb-6">Visit a destination or hotel and share your experience!</p>
            <Link to="/destinations" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">Explore Destinations</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any, i: number) => (
              <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-card p-6 shadow-card border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${review.target_type === 'place' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                        {review.target_type === 'place' ? '📍 Destination' : '🏨 Hotel'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${review.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {review.is_approved ? '✅ Approved' : '⏳ Pending approval'}
                      </span>
                      {review.is_edited && <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600">✏️ Edited ({review.edit_count || 1}/3)</span>}
                    </div>

                    {review.title && <h3 className="font-heading font-semibold text-lg mb-1">{review.title}</h3>}

                    {/* Star rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={16} className={s <= review.rating ? 'fill-accent text-accent' : 'text-gray-200'} />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">{review.rating}/5</span>
                    </div>

                    {review.comment && <p className="text-sm text-gray-600 line-clamp-3">{review.comment}</p>}

                    <p className="text-xs text-gray-400 mt-3">
                      Posted on {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <button
                    onClick={() => { if (confirm('Delete this review?')) deleteMutation.mutate(review.id); }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
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

export default MyReviewsPage;
