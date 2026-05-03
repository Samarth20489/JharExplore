import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, IndianRupee, Star, ArrowLeft, Navigation, Train, Plane, Car, Check, AlertTriangle, Lightbulb, MapPinned, Loader2, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { CATEGORIES, formatCurrency } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PlaceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  // Review form state
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  const { data: place, isLoading, error } = useQuery({
    queryKey: ['place', slug],
    queryFn: async () => {
      const res = await api.get(`/places/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  // Fetch reviews for this place
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', place?.id],
    queryFn: async () => {
      const res = await api.get(`/feedback?target_type=place&target_id=${place.id}&limit=50`);
      return res.data;
    },
    enabled: !!place?.id,
  });
  const reviews = reviewsData?.data || [];

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to post a review');
    if (reviewForm.rating === 0) return toast.error('Please select a rating');
    if (reviewForm.comment.length < 10) return toast.error('Review must be at least 10 characters');

    setSubmittingReview(true);
    try {
      if (editingReview) {
        await api.put(`/feedback/${editingReview.id}`, { rating: reviewForm.rating, title: reviewForm.title.trim(), comment: reviewForm.comment.trim() });
        toast.success('Review updated — pending re-moderation');
        setEditingReview(null);
      } else {
        await api.post('/feedback', { target_type: 'place', target_id: place.id, rating: reviewForm.rating, title: reviewForm.title.trim(), comment: reviewForm.comment.trim() });
        toast.success('Review submitted! It will appear after approval.');
      }
      setReviewForm({ rating: 0, title: '', comment: '' });
      queryClient.invalidateQueries({ queryKey: ['reviews', place?.id] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  const startEdit = (r: any) => {
    if ((r.edit_count || 0) >= 3) return toast.error('Maximum edit limit reached');
    setEditingReview(r);
    setReviewForm({ rating: r.rating, title: r.title || '', comment: r.comment || '' });
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/feedback/${id}`);
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['reviews', place?.id] });
    } catch { toast.error('Failed to delete'); }
  };

  if (isLoading) return <LoadingSpinner fullScreen text="Loading destination..." />;
  if (error || !place) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="text-6xl block mb-4">🏔️</span>
        <h2 className="font-heading text-2xl font-bold mb-2">Destination Not Found</h2>
        <Link to="/destinations" className="btn-primary mt-4 inline-block">Browse Destinations</Link>
      </div>
    </div>
  );

  const entryFee = typeof place.entry_fee === 'string' ? JSON.parse(place.entry_fee) : place.entry_fee;
  const howToReach = typeof place.how_to_reach === 'string' ? JSON.parse(place.how_to_reach) : place.how_to_reach;
  const catInfo = CATEGORIES.find(c => c.value === place.category);
  const hasReviewed = reviews.some((r: any) => r.user_id === user?.id);

  // Compute review summary
  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) : 0;
  const ratingDist = [5, 4, 3, 2, 1].map(n => ({ star: n, count: reviews.filter((r: any) => r.rating === n).length }));

  return (
    <>
      <Helmet>
        <title>{place.name} — JharExplore</title>
        <meta name="description" content={place.short_description || place.description?.slice(0, 160)} />
      </Helmet>

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img src={place.thumbnail || place.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920'} alt={place.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto">
          <Link to="/destinations" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm transition-colors">
            <ArrowLeft size={16} /> Back to Destinations
          </Link>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="category-badge !bg-white/20 !text-white backdrop-blur-sm">{catInfo?.icon} {place.category}</span>
            {place.avg_rating > 0 && (
              <span className="flex items-center gap-1 text-white text-sm"><Star size={14} className="fill-accent text-accent" /> {Number(place.avg_rating).toFixed(1)} ({place.total_reviews} reviews)</span>
            )}
          </div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-3xl md:text-5xl font-bold text-white mb-2">{place.name}</motion.h1>
          <p className="flex items-center gap-2 text-white/80"><MapPin size={16} /> {place.district}, Jharkhand</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-card p-6 md:p-8 shadow-card">
            <h2 className="font-heading text-2xl font-semibold mb-4">About {place.name}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{place.description}</p>
          </motion.div>

          {/* Things to Do */}
          {place.things_to_do?.length > 0 && (
            <div className="bg-white rounded-card p-6 shadow-card">
              <h3 className="font-heading text-xl font-semibold mb-4">🎯 Things to Do</h3>
              <div className="space-y-2">
                {place.things_to_do.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl">
                    <span className="text-primary font-bold text-sm mt-0.5">{i + 1}.</span>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {place.images?.length > 0 && (
            <div className="bg-white rounded-card p-6 shadow-card">
              <h3 className="font-heading text-xl font-semibold mb-4">📸 Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {place.images.map((img: string, i: number) => (
                  <img key={i} src={img} alt={`${place.name} ${i + 1}`} className="w-full h-40 object-cover rounded-xl hover:opacity-90 transition-opacity cursor-pointer" loading="lazy" />
                ))}
              </div>
            </div>
          )}

          {/* How to Reach */}
          {howToReach && (
            <div className="bg-white rounded-card p-6 shadow-card">
              <h3 className="font-heading text-xl font-semibold mb-4">🚗 How to Reach</h3>
              <div className="space-y-4">
                {howToReach.by_road && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><Car size={20} className="text-blue-600" /></div>
                    <div><h4 className="font-medium text-dark">By Road</h4><p className="text-sm text-gray-600">{howToReach.by_road}</p></div>
                  </div>
                )}
                {howToReach.by_train && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0"><Train size={20} className="text-green-600" /></div>
                    <div><h4 className="font-medium text-dark">By Train</h4><p className="text-sm text-gray-600">{howToReach.by_train}</p></div>
                  </div>
                )}
                {howToReach.by_air && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0"><Plane size={20} className="text-purple-600" /></div>
                    <div><h4 className="font-medium text-dark">By Air</h4><p className="text-sm text-gray-600">{howToReach.by_air}</p></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Visitor Tips */}
          {place.tips?.length > 0 && (
            <div className="bg-yellow-50 rounded-card p-6 border border-yellow-100">
              <h3 className="font-heading text-xl font-semibold mb-4 text-yellow-800">💡 Visitor Tips</h3>
              <div className="space-y-2">
                {place.tips.map((tip: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <Lightbulb size={14} className="text-yellow-600 mt-1 shrink-0" />
                    <span className="text-sm text-yellow-900">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permit Notice */}
          {place.permit_required && (
            <div className="bg-amber-50 rounded-card p-6 border-2 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle size={24} className="text-amber-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-amber-800">⚠️ Permit Required</h3>
                  <p className="text-sm text-amber-700 mt-1">{place.permit_details || 'A special permit is required to visit this destination. Please check with local authorities.'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Embedded Google Map — ALWAYS shown */}
          <div className="bg-white rounded-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl font-semibold flex items-center gap-2">📍 Location on Map</h3>
              {place.latitude && place.longitude && (
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-full transition-colors">
                  <Navigation size={12} /> Get Directions
                </a>
              )}
            </div>
            {place.latitude && place.longitude ? (
              <iframe
                title={`${place.name} location`}
                src={`https://maps.google.com/maps?q=${place.latitude},${place.longitude}&z=14&output=embed`}
                width="100%"
                height="380"
                style={{ border: 0, borderRadius: '16px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
                <MapPin size={32} />
                <p className="text-sm font-medium">Map coming soon</p>
                <p className="text-xs text-center px-4">Coordinates for {place.name} are being verified</p>
              </div>
            )}
          </div>

          {/* ═══════════════════ REVIEWS SECTION ═══════════════════ */}
          <div className="bg-white rounded-card p-6 md:p-8 shadow-card" id="reviews">
            <h3 className="font-heading text-2xl font-semibold mb-6">⭐ Reviews & Ratings</h3>

            {/* Summary */}
            {reviews.length > 0 && (
              <div className="flex items-start gap-8 mb-8 flex-wrap">
                <div className="text-center">
                  <p className="text-5xl font-bold text-dark">{avgRating.toFixed(1)}</p>
                  <div className="flex justify-center mt-1">{[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= Math.round(avgRating) ? 'fill-accent text-accent' : 'text-gray-200'} />)}</div>
                  <p className="text-sm text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  {ratingDist.map(d => (
                    <div key={d.star} className="flex items-center gap-2">
                      <span className="text-xs w-6 text-right">{d.star}★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${reviews.length > 0 ? (d.count / reviews.length) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-6">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Write/Edit Review Form */}
            {isAuthenticated ? (
              !hasReviewed || editingReview ? (
                <form onSubmit={submitReview} className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                  <h4 className="font-heading font-semibold text-lg mb-4">{editingReview ? 'Edit Your Review' : 'Write a Review'}</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewForm(f => ({...f, rating: s}))} className="text-2xl transition-transform hover:scale-110">{s <= reviewForm.rating ? '★' : '☆'}</button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4"><input type="text" placeholder="Summarise your visit" value={reviewForm.title} maxLength={100} onChange={e => setReviewForm(f => ({...f, title: e.target.value}))} className="input-field" /></div>
                  <div className="mb-4"><textarea placeholder="Share your experience in detail..." value={reviewForm.comment} minLength={10} maxLength={1000} onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))} rows={4} required className="input-field resize-none" /></div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={submittingReview} className="bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
                      {submittingReview ? <><Loader2 size={16} className="animate-spin" /> Posting...</> : editingReview ? 'Update Review' : 'Post Review'}
                    </button>
                    {editingReview && <button type="button" onClick={() => { setEditingReview(null); setReviewForm({ rating: 0, title: '', comment: '' }); }} className="text-gray-500 px-4 py-3 rounded-xl hover:bg-gray-100">Cancel</button>}
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-4 bg-green-50 rounded-xl border border-green-200 text-sm text-green-700">
                  ✅ You've already reviewed this destination.
                </div>
              )
            ) : (
              <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600">
                🔒 <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link> to write a review.
              </div>
            )}

            {/* Review List */}
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">📝</span>
                <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="p-5 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">{review.users?.full_name?.[0] || '?'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{review.users?.full_name || 'Traveller'}</p>
                          <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= review.rating ? 'fill-accent text-accent' : 'text-gray-200'} />)}
                      </div>
                    </div>
                    {review.title && <h5 className="font-semibold mt-3">{review.title}</h5>}
                    {review.comment && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>}
                    {user?.id === review.user_id && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                        <button onClick={() => startEdit(review)} className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"><Pencil size={12} /> Edit</button>
                        <button onClick={() => deleteReview(review.id)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                        {!review.is_approved && <span className="ml-auto text-xs px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-medium">Awaiting moderation</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-card p-6 shadow-card sticky top-24">
            <h3 className="font-heading text-lg font-semibold mb-4">Quick Info</h3>

            {place.opening_hours && (
              <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                <Clock size={18} className="text-primary" />
                <div>
                  <p className="text-xs text-gray-500">Opening Hours</p>
                  <p className="text-sm font-medium">{place.opening_hours}</p>
                </div>
              </div>
            )}

            {place.best_time_to_visit && (
              <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                <Clock size={18} className="text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Best Time to Visit</p>
                  <p className="text-sm font-medium">{place.best_time_to_visit}</p>
                </div>
              </div>
            )}

            {entryFee && (
              <div className="py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <IndianRupee size={18} className="text-primary" />
                  <p className="text-xs text-gray-500">Entry Fee</p>
                </div>
                <div className="grid grid-cols-3 gap-2 ml-8">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Adult</p>
                    <p className="font-medium text-sm">₹{entryFee.adult || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Child</p>
                    <p className="font-medium text-sm">₹{entryFee.child || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Foreign</p>
                    <p className="font-medium text-sm">₹{entryFee.foreign || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {place.facilities?.length > 0 && (
              <div className="py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Facilities</p>
                <div className="flex flex-wrap gap-2">
                  {place.facilities.map((f: string) => (
                    <span key={f} className="flex items-center gap-1 text-xs bg-primary/5 text-primary px-2 py-1 rounded-lg"><Check size={12} />{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Places */}
            {place.nearby_places?.length > 0 && (
              <div className="py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Nearby Places</p>
                <div className="flex flex-wrap gap-1.5">
                  {place.nearby_places.map((np: string) => (
                    <span key={np} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">{np}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {place.tags?.length > 0 && (
              <div className="py-3">
                <p className="text-xs text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {place.tags.map((t: string) => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg capitalize">{t}</span>
                  ))}
                </div>
              </div>
            )}

            <Link to="/hotels" className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              Find Nearby Hotels <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default PlaceDetailPage;
