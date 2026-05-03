import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Star, ArrowLeft, Phone, Mail, Clock, Shield, Check, ExternalLink, Navigation, ChevronLeft, ChevronRight, Loader2, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { formatCurrency, cn } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AMENITY_ICONS: Record<string, string> = {
  'Wi-Fi': '📶', 'Free Wi-Fi': '📶', 'Restaurant': '🍽️', 'AC': '❄️', 'Parking': '🅿️',
  'Pool': '🏊', 'Spa': '💆', 'Gym': '🏋️', 'Bar': '🍸', 'Room Service': '🛎️',
  'TV': '📺', 'Business Center': '💼', 'Garden': '🌿', 'Laundry': '👔', 'Café': '☕',
  'Dorm beds': '🛏️', 'Lockers': '🔒', 'Common kitchen': '🍳', 'Hot water': '🚿',
  '24h reception': '🕐', 'Bonfire area': '🔥', 'Trekking gear rental': '🎒',
  'Guide service': '🗺️', 'Traditional meals included': '🍛', 'Safari booking': '🐘',
  'Rooftop lounge': '🌅', 'Forest views': '🌲', 'Safari coordination': '🐅',
};

const HotelDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeImg, setActiveImg] = useState(0);
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' });
  const [editingReview, setEditingReview] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: hotel, isLoading, error } = useQuery({
    queryKey: ['hotel', slug],
    queryFn: async () => { const res = await api.get(`/hotels/${slug}`); return res.data.data; },
    enabled: !!slug,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['hotel-reviews', hotel?.id],
    queryFn: async () => { const res = await api.get(`/feedback?target_type=hotel&target_id=${hotel.id}&limit=50`); return res.data; },
    enabled: !!hotel?.id,
  });
  const reviews = reviewsData?.data || [];

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to post a review');
    if (reviewForm.rating === 0) return toast.error('Please select a rating');
    if (reviewForm.comment.length < 10) return toast.error('Review must be at least 10 characters');
    setSubmitting(true);
    try {
      if (editingReview) {
        await api.put(`/feedback/${editingReview.id}`, { rating: reviewForm.rating, title: reviewForm.title.trim(), comment: reviewForm.comment.trim() });
        toast.success('Review updated — pending re-moderation');
        setEditingReview(null);
      } else {
        await api.post('/feedback', { target_type: 'hotel', target_id: hotel.id, rating: reviewForm.rating, title: reviewForm.title.trim(), comment: reviewForm.comment.trim() });
        toast.success('Review submitted! It will appear after approval.');
      }
      setReviewForm({ rating: 0, title: '', comment: '' });
      queryClient.invalidateQueries({ queryKey: ['hotel-reviews', hotel?.id] });
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed to submit review'); }
    setSubmitting(false);
  };

  const startEdit = (r: any) => {
    if ((r.edit_count || 0) >= 3) return toast.error('Maximum edit limit reached');
    setEditingReview(r);
    setReviewForm({ rating: r.rating, title: r.title || '', comment: r.comment || '' });
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try { await api.delete(`/feedback/${id}`); toast.success('Review deleted'); queryClient.invalidateQueries({ queryKey: ['hotel-reviews', hotel?.id] }); }
    catch { toast.error('Failed to delete'); }
  };

  if (isLoading) return <LoadingSpinner fullScreen text="Loading hotel..." />;
  if (error || !hotel) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><span className="text-6xl block mb-4">🏨</span><h2 className="font-heading text-2xl font-bold mb-2">Hotel Not Found</h2><Link to="/hotels" className="btn-primary mt-4 inline-block">Browse Hotels</Link></div>
    </div>
  );

  const images = hotel.images?.length > 0 ? hotel.images : [hotel.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920'];
  const bookingUrl = hotel.booking_url || `https://www.google.com/search?q=${encodeURIComponent(hotel.name + ' ' + hotel.district + ' Jharkhand book hotel')}`;
  const bookingPlatform = hotel.booking_platform || 'Google Search';
  const hasReviewed = reviews.some((r: any) => r.user_id === user?.id);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) : 0;
  const ratingDist = [5,4,3,2,1].map(n => ({ star: n, count: reviews.filter((r: any) => r.rating === n).length }));

  return (
    <>
      <Helmet><title>{hotel.name} — JharExplore Hotels</title><meta name="description" content={hotel.description || `Book ${hotel.name} in ${hotel.district}, Jharkhand`} /></Helmet>

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img src={images[activeImg]} alt={hotel.name} className="w-full h-full object-cover transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent" />
        {images.length > 1 && (<>
          <button onClick={() => setActiveImg(i => i > 0 ? i - 1 : images.length - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"><ChevronLeft size={20} /></button>
          <button onClick={() => setActiveImg(i => i < images.length - 1 ? i + 1 : 0)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"><ChevronRight size={20} /></button>
        </>)}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto">
          <Link to="/hotels" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm"><ArrowLeft size={16} /> Back to Hotels</Link>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className={cn('text-xs font-bold px-3 py-1 rounded-lg capitalize', hotel.property_type === 'hostel' ? 'bg-blue-500 text-white' : hotel.property_type === 'homestay' ? 'bg-amber-500 text-white' : hotel.property_type === 'forest-rest-house' ? 'bg-green-600 text-white' : 'bg-white/20 text-white backdrop-blur-sm')}>
              {hotel.property_type === 'forest-rest-house' ? '🌲 Forest Lodge' : hotel.property_type === 'hostel' ? '🛏️ Hostel' : hotel.property_type === 'homestay' ? '🏠 Homestay' : `${hotel.star_rating || 3}★ Hotel`}
            </span>
            {hotel.avg_rating > 0 && <span className="flex items-center gap-1 text-white text-sm"><Star size={14} className="fill-accent text-accent" /> {Number(hotel.avg_rating).toFixed(1)}</span>}
          </div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-3xl md:text-5xl font-bold text-white mb-2">{hotel.name}</motion.h1>
          <p className="flex items-center gap-2 text-white/80"><MapPin size={16} /> {hotel.address || hotel.district}, Jharkhand</p>
        </div>
      </section>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img: string, i: number) => (
              <button key={i} onClick={() => setActiveImg(i)} className={cn('shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all', activeImg === i ? 'border-primary ring-2 ring-primary/30' : 'border-white/50 opacity-60 hover:opacity-100')}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {hotel.description && (
            <div className="bg-white rounded-card p-6 md:p-8 shadow-card">
              <h2 className="font-heading text-2xl font-semibold mb-4">About {hotel.name}</h2>
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </div>
          )}
          {hotel.amenities?.length > 0 && (
            <div className="bg-white rounded-card p-6 shadow-card">
              <h3 className="font-heading text-xl font-semibold mb-4">Amenities & Facilities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hotel.amenities.map((a: string) => (<div key={a} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl"><span className="text-lg">{AMENITY_ICONS[a] || '✓'}</span><span className="text-sm font-medium text-gray-700">{a}</span></div>))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-card p-6 shadow-card">
              <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"><Clock size={18} className="text-primary" />Timings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl"><span className="text-sm text-gray-600">Check-in</span><span className="font-semibold text-green-700">{hotel.check_in_time || '12:00 PM'}</span></div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl"><span className="text-sm text-gray-600">Check-out</span><span className="font-semibold text-red-700">{hotel.check_out_time || '11:00 AM'}</span></div>
              </div>
            </div>
            {hotel.policies?.length > 0 && (
              <div className="bg-white rounded-card p-6 shadow-card">
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"><Shield size={18} className="text-primary" />Policies</h3>
                <div className="space-y-2">{hotel.policies.map((p: string, i: number) => (<div key={i} className="flex items-start gap-2"><Check size={14} className="text-primary mt-1 shrink-0" /><span className="text-sm text-gray-600">{p}</span></div>))}</div>
              </div>
            )}
          </div>

          {/* Map — ALWAYS rendered */}
          <div className="bg-white rounded-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl font-semibold flex items-center gap-2">📍 Location on Map</h3>
              {hotel.latitude && hotel.longitude && (
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${hotel.latitude},${hotel.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-full transition-colors">
                  <Navigation size={12} /> Get Directions
                </a>
              )}
            </div>
            {hotel.latitude && hotel.longitude ? (
              <iframe title={`${hotel.name} location`} src={`https://maps.google.com/maps?q=${hotel.latitude},${hotel.longitude}&z=15&output=embed`} width="100%" height="350" style={{ border: 0, borderRadius: '16px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
                <MapPin size={32} /><p className="text-sm font-medium">Map coming soon</p><p className="text-xs text-center px-4">Coordinates for {hotel.name} are being verified</p>
              </div>
            )}
            {hotel.address && <p className="flex items-start gap-2 mt-3 text-xs text-gray-500"><MapPin size={14} className="shrink-0 mt-0.5" />{hotel.address}, {hotel.district}, Jharkhand</p>}
          </div>

          {/* ═══ REVIEWS SECTION ═══ */}
          <div className="bg-white rounded-card p-6 md:p-8 shadow-card" id="reviews">
            <h3 className="font-heading text-2xl font-semibold mb-6">⭐ Guest Reviews</h3>
            {reviews.length > 0 && (
              <div className="flex items-start gap-8 mb-8 flex-wrap">
                <div className="text-center">
                  <p className="text-5xl font-bold text-dark">{avgRating.toFixed(1)}</p>
                  <div className="flex justify-center mt-1">{[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= Math.round(avgRating) ? 'fill-accent text-accent' : 'text-gray-200'} />)}</div>
                  <p className="text-sm text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  {ratingDist.map(d => (<div key={d.star} className="flex items-center gap-2"><span className="text-xs w-6 text-right">{d.star}★</span><div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full transition-all" style={{ width: `${reviews.length > 0 ? (d.count / reviews.length) * 100 : 0}%` }} /></div><span className="text-xs text-gray-500 w-6">{d.count}</span></div>))}
                </div>
              </div>
            )}

            {isAuthenticated ? (
              !hasReviewed || editingReview ? (
                <form onSubmit={submitReview} className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                  <h4 className="font-heading font-semibold text-lg mb-4">{editingReview ? 'Edit Your Review' : 'Write a Review'}</h4>
                  <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label><div className="flex gap-1">{[1,2,3,4,5].map(s => (<button key={s} type="button" onClick={() => setReviewForm(f => ({...f, rating: s}))} className="text-2xl transition-transform hover:scale-110">{s <= reviewForm.rating ? '★' : '☆'}</button>))}</div></div>
                  <div className="mb-4"><input type="text" placeholder="Summarise your stay" value={reviewForm.title} maxLength={100} onChange={e => setReviewForm(f => ({...f, title: e.target.value}))} className="input-field" /></div>
                  <div className="mb-4"><textarea placeholder="Share your experience..." value={reviewForm.comment} minLength={10} maxLength={1000} onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))} rows={4} required className="input-field resize-none" /></div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={submitting} className="bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
                      {submitting ? <><Loader2 size={16} className="animate-spin" /> Posting...</> : editingReview ? 'Update Review' : 'Post Review'}
                    </button>
                    {editingReview && <button type="button" onClick={() => { setEditingReview(null); setReviewForm({ rating: 0, title: '', comment: '' }); }} className="text-gray-500 px-4 py-3 rounded-xl hover:bg-gray-100">Cancel</button>}
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-4 bg-green-50 rounded-xl border border-green-200 text-sm text-green-700">✅ You've already reviewed this hotel.</div>
              )
            ) : (
              <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600">🔒 <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link> to write a review.</div>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-8"><span className="text-4xl block mb-2">📝</span><p className="text-gray-500">No reviews yet. Be the first to share your experience!</p></div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="p-5 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-primary font-bold text-sm">{review.users?.full_name?.[0] || '?'}</span></div>
                        <div>
                          <p className="font-medium text-sm">{review.users?.full_name || 'Guest'}</p>
                          <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}{review.is_edited && <span className="ml-1 text-gray-300">(edited)</span>}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= review.rating ? 'fill-accent text-accent' : 'text-gray-200'} />)}</div>
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
          <div className="bg-white rounded-card p-6 shadow-card sticky top-24">
            <div className="text-center mb-6">
              {hotel.property_type === 'hostel' && hotel.price_per_bed ? (<><p className="text-3xl font-bold text-primary">{formatCurrency(hotel.price_per_bed)}<span className="text-sm font-normal text-gray-500">/bed</span></p><p className="text-sm text-gray-500 mt-1">Private room from {formatCurrency(hotel.price_per_night)}/night</p></>) : (<p className="text-3xl font-bold text-primary">{formatCurrency(hotel.price_per_night)}<span className="text-sm font-normal text-gray-500">/night</span></p>)}
            </div>
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-accent to-terracotta text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all text-lg">🏨 Book Now on {bookingPlatform} <ExternalLink size={16} /></a>
            <p className="text-xs text-gray-400 text-center mt-3">You'll be redirected to {bookingPlatform}</p>
            {hotel.best_for && (<div className="mt-6 p-4 bg-primary/5 rounded-xl"><p className="text-xs font-semibold text-primary uppercase mb-1">Best For</p><p className="text-sm text-gray-700">{hotel.best_for}</p></div>)}
            <div className="mt-6 space-y-3">
              {hotel.phone && (<a href={`tel:${hotel.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"><Phone size={16} className="text-primary" /><span className="text-sm font-medium">{hotel.phone}</span></a>)}
              {hotel.email && (<a href={`mailto:${hotel.email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"><Mail size={16} className="text-primary" /><span className="text-sm font-medium">{hotel.email}</span></a>)}
            </div>
            {hotel.rooms?.length > 0 && (
              <div className="mt-6"><h4 className="font-heading font-semibold mb-3">Available Rooms</h4><div className="space-y-2">{hotel.rooms.map((room: any) => (<div key={room.id} className="p-3 border border-gray-200 rounded-xl"><div className="flex items-center justify-between"><div><p className="font-medium text-sm">{room.name}</p><p className="text-xs text-gray-500 capitalize">{room.room_type} · Max {room.max_occupancy}</p></div><p className="font-bold text-primary">{formatCurrency(room.price_per_night)}</p></div></div>))}</div></div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 lg:hidden z-40">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div><p className="text-xl font-bold text-primary">{formatCurrency(hotel.property_type === 'hostel' && hotel.price_per_bed ? hotel.price_per_bed : hotel.price_per_night)}</p><p className="text-xs text-gray-500">{hotel.property_type === 'hostel' && hotel.price_per_bed ? '/bed/night' : '/night'}</p></div>
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-accent to-terracotta text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2">Book Now <ExternalLink size={14} /></a>
        </div>
      </div>
    </>
  );
};

export default HotelDetailPage;
