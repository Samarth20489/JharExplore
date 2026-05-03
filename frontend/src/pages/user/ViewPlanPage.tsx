import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, IndianRupee, Calendar, Users, Star, Save, Package, AlertTriangle, Lightbulb, CheckCircle2, Utensils, Printer, Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { formatCurrency, cn } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ViewPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeDay, setActiveDay] = useState(0);

  const { data: planData, isLoading } = useQuery({
    queryKey: ['plan', id],
    queryFn: async () => {
      const res = await api.get(`/planner/my-plans/${id}`);
      return res.data.data;
    },
    enabled: !!id && isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold mb-4">Please Login</h2>
          <Link to="/login" className="btn-primary">Login to View Plan</Link>
        </div>
      </section>
    );
  }

  if (isLoading) return <LoadingSpinner fullScreen text="Loading your plan..." />;

  if (!planData) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="text-center">
          <span className="text-6xl block mb-4">🗺️</span>
          <h2 className="font-heading text-2xl font-bold mb-2">Plan Not Found</h2>
          <Link to="/dashboard/plans" className="btn-primary mt-4 inline-block">Back to Saved Plans</Link>
        </div>
      </section>
    );
  }

  // Plan JSON is stored in the itinerary field
  const plan = planData.itinerary || {};
  const meta = (() => { try { return JSON.parse(planData.prompt_used || '{}'); } catch { return {}; } })();

  return (
    <>
      <Helmet><title>{planData.title || 'Saved Plan'} — JharExplore</title></Helmet>

      {/* Header */}
      <section className="pt-24 pb-6 px-4 bg-gradient-to-b from-dark to-primary/90 text-white">
        <div className="max-w-5xl mx-auto">
          <Link to="/dashboard/plans" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm transition-colors">
            <ArrowLeft size={16} /> Back to Saved Plans
          </Link>
          <div className="flex items-center gap-3 flex-wrap text-sm text-white/60">
            {meta.location && <span className="flex items-center gap-1"><MapPin size={14} /> {meta.location}</span>}
            {meta.budget && <span className="flex items-center gap-1"><IndianRupee size={14} /> {formatCurrency(meta.budget)}</span>}
            {meta.days && <span className="flex items-center gap-1"><Calendar size={14} /> {meta.days} days</span>}
            {meta.travelers && <span className="flex items-center gap-1"><Users size={14} /> {meta.travelers} travelers</span>}
          </div>
          <p className="text-xs text-white/40 mt-2">Saved on {new Date(planData.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </section>

      {/* Plan Content — mirrors AiPlannerPage render */}
      <section className="py-8 px-4 max-w-5xl mx-auto space-y-6">
        {/* Header card */}
        <div className="bg-gradient-to-br from-dark via-dark-100 to-primary/70 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-accent text-sm font-semibold uppercase tracking-wider mb-1">Saved Trip Plan</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold">{plan.tripTitle || planData.title}</h2>
            {plan.summary && <p className="text-white/70 mt-3 max-w-2xl">{plan.summary}</p>}
            {plan.budgetHonesty && (
              <div className={cn('inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-pill text-sm font-medium', plan.budgetHonesty?.includes('Comfortable') ? 'bg-green-500/20 text-green-300' : plan.budgetHonesty?.includes('Tight') ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300')}>
                {plan.budgetHonesty?.includes('Comfortable') ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{plan.budgetHonesty}
              </div>
            )}
          </div>
        </div>

        {/* Budget breakdown */}
        {plan.budgetBreakdown && (
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"><IndianRupee size={18} className="text-primary" />Budget Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[{ k: 'intercityTransport', l: 'Transport' }, { k: 'accommodation', l: 'Stay' }, { k: 'food', l: 'Food' }, { k: 'activities', l: 'Activities' }].map(({ k, l }) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-xs text-gray-500">{l}</p><p className="text-lg font-bold text-dark">{formatCurrency(plan.budgetBreakdown[k] || 0)}</p></div>
              ))}
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl"><span className="font-semibold">Total</span><span className="text-xl font-bold text-primary">{formatCurrency(plan.budgetBreakdown.total || 0)}</span></div>
            {plan.budgetBreakdown.perPersonCost && <p className="text-sm text-gray-500 mt-2">Per person: <strong>{formatCurrency(plan.budgetBreakdown.perPersonCost)}</strong></p>}
            {plan.budgetBreakdown.savingTips?.length > 0 && (
              <div className="mt-4 space-y-1">{plan.budgetBreakdown.savingTips.map((t: string, i: number) => (<p key={i} className="text-sm text-gray-600 flex items-start gap-2"><Lightbulb size={14} className="text-accent mt-0.5 shrink-0" />{t}</p>))}</div>
            )}
          </div>
        )}

        {/* Transport Options */}
        {plan.transport?.options?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-heading text-lg font-semibold mb-4">🚂 Transport Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.transport.options.map((opt: any, i: number) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn('text-xs font-bold uppercase px-2 py-0.5 rounded', opt.type === 'train' ? 'bg-blue-100 text-blue-700' : opt.type === 'flight' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700')}>{opt.type || 'transport'}</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(opt.approxCost || 0)}</span>
                  </div>
                  <h4 className="font-semibold text-sm">{opt.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{opt.from} → {opt.to} • {opt.duration}{opt.class ? ` • ${opt.class}` : ''}</p>
                  {opt.tips && <p className="text-xs text-gray-400 mt-1 italic">{opt.tips}</p>}
                  {opt.bookingLink && <a href={opt.bookingLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">🔗 Book Now</a>}
                </div>
              ))}
            </div>
            {plan.transport.localTransport && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium">🛺 Local: {plan.transport.localTransport.primary}</p>
                <p className="text-xs text-gray-500 mt-1">~{formatCurrency(plan.transport.localTransport.dailyCost || 0)}/day • {plan.transport.localTransport.tips}</p>
              </div>
            )}
          </div>
        )}

        {/* Hotels */}
        {plan.accommodation?.recommended?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-heading text-lg font-semibold mb-4">🏨 Recommended Stays</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.accommodation.recommended.map((h: any, i: number) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1"><h4 className="font-semibold">{h.name}</h4><span className="text-xs text-gray-500">{h.rating}</span></div>
                  <p className="text-xs text-gray-500">{h.location}</p>
                  <p className="text-lg font-bold text-primary mt-1">{formatCurrency(h.pricePerNight || 0)}<span className="text-xs font-normal text-gray-400">/night</span></p>
                  {h.highlights && <p className="text-xs text-gray-500 mt-1">{h.highlights}</p>}
                  <div className="flex gap-2 mt-3">
                    {h.bookingLink && <a href={h.bookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">🔗 Book</a>}
                    {h.phone && <a href={`tel:${h.phone}`} className="inline-flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">📞 {h.phone}</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day-by-day */}
        {plan.days?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"><Calendar size={18} className="text-primary" />Day-by-Day Itinerary</h3>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4">{plan.days.map((d: any, i: number) => (
              <button key={i} onClick={() => setActiveDay(i)} className={cn('px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-all', activeDay === i ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>Day {d.day}</button>
            ))}</div>
            <AnimatePresence mode="wait">
              <motion.div key={activeDay} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                {(() => { const d = plan.days[activeDay]; return d ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-heading text-xl font-semibold">{d.title}</h4>
                      <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-pill">{formatCurrency(d.estimatedDayCost || 0)}</span>
                    </div>
                    {d.locations?.length > 0 && <div className="flex flex-wrap gap-2">{d.locations.map((l: string) => <span key={l} className="category-badge">{l}</span>)}</div>}
                    {[{ t: '🌅 Morning', v: d.morning }, { t: '☀️ Afternoon', v: d.afternoon }, { t: '🌙 Evening', v: d.evening }].map(({ t, v }) => v && (
                      <div key={t} className="bg-gray-50 rounded-xl p-4"><h5 className="font-semibold text-sm mb-1">{t}</h5><p className="text-sm text-gray-600">{v}</p></div>
                    ))}
                    {d.meals && <div className="grid grid-cols-3 gap-3">{Object.entries(d.meals).map(([k, v]) => <div key={k} className="bg-accent/5 rounded-xl p-3"><p className="text-xs font-semibold text-accent-700 capitalize"><Utensils size={12} className="inline mr-1" />{k}</p><p className="text-xs text-gray-600 mt-1">{v as string}</p></div>)}</div>}
                    {d.localTip && <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-100"><Lightbulb size={16} className="text-yellow-600 mt-0.5 shrink-0" /><p className="text-sm text-yellow-800"><strong>Local Tip:</strong> {d.localTip}</p></div>}
                  </div>
                ) : null; })()}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Packing + Must Know */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plan.packingChecklist && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2"><Package size={18} className="text-primary" />Packing List</h3>
              {Object.entries(plan.packingChecklist).map(([cat, items]) => {
                const arr = Array.isArray(items) ? items : typeof items === 'string' ? [items] : [];
                if (arr.length === 0) return null;
                return (
                  <div key={cat} className="mb-3"><p className="text-xs font-semibold text-gray-500 uppercase mb-1">{cat.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <div className="space-y-1">{arr.map((item: any, i: number) => <p key={i} className="text-sm text-gray-600 flex items-center gap-2"><CheckCircle2 size={12} className="text-primary shrink-0" />{String(item)}</p>)}</div>
                  </div>
                );
              })}
            </div>
          )}
          {plan.mustKnow?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2"><AlertTriangle size={18} className="text-accent" />Must Know</h3>
              <div className="space-y-2">{plan.mustKnow.map((tip: string, i: number) => <p key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-accent font-bold shrink-0">{i + 1}.</span>{tip}</p>)}</div>
            </div>
          )}
        </div>

        {/* Emergency + Nearby */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plan.emergencyContacts && (
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <h3 className="font-heading text-lg font-semibold mb-3 text-red-700">🚨 Emergency Contacts</h3>
              <div className="space-y-2">
                {Object.entries(plan.emergencyContacts).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <a href={`tel:${v}`} className="text-sm font-semibold text-red-600 hover:underline">{String(v)}</a>
                  </div>
                ))}
              </div>
            </div>
          )}
          {plan.nearbyAttractions?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-heading text-lg font-semibold mb-3">🗺️ Nearby Attractions</h3>
              <div className="flex flex-wrap gap-2">{plan.nearbyAttractions.map((a: string, i: number) => <span key={i} className="bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-pill">{a}</span>)}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center pt-4 pb-8">
          <Link to="/dashboard/planner" className="bg-primary text-white font-semibold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Sparkles size={16} /> Create New Plan
          </Link>
          <button onClick={() => window.print()} className="border-2 border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </section>
    </>
  );
};

export default ViewPlanPage;
