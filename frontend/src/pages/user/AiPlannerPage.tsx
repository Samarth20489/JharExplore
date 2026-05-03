import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Save, MapPin, IndianRupee, Calendar, Users, Sparkles, Loader2, ChevronDown, Clock, Utensils, Lightbulb, CheckCircle2, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { cn, formatCurrency } from '../../utils/helpers';

const INTERESTS = [
  { id: 'nature', label: 'Nature & Waterfalls', icon: '💧' },
  { id: 'temples', label: 'Temples & Spirituality', icon: '🛕' },
  { id: 'wildlife', label: 'Wildlife & Forests', icon: '🐅' },
  { id: 'adventure', label: 'Adventure Sports', icon: '🏔️' },
  { id: 'tribal', label: 'Tribal Culture', icon: '🎭' },
  { id: 'food', label: 'Local Food', icon: '🍛' },
];

const STYLES = [
  { value: 'budget', label: 'Budget', desc: 'Hostels, dhabas, shared transport', icon: '🎒' },
  { value: 'comfort', label: 'Comfort', desc: '3-star hotels, restaurants, private cabs', icon: '🏨' },
  { value: 'luxury', label: 'Luxury', desc: 'Premium resorts, fine dining, chauffeur', icon: '✨' },
];

const AiPlannerPage: React.FC = () => {
  const { isAuthenticated, session } = useAuthStore();
  const [form, setForm] = useState({ location: '', budget: 15000, days: 3, travelers: 2, travelStyle: 'comfort', interests: [] as string[], travelDates: '' });
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  const toggleInterest = (id: string) => {
    setForm(f => ({ ...f, interests: f.interests.includes(id) ? f.interests.filter(i => i !== id) : [...f.interests, id] }));
  };

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.location.trim()) return toast.error('Enter your origin city');
    if (form.interests.length === 0) return toast.error('Select at least one interest');
    setLoading(true);
    setPlan(null);
    try {
      const res = await api.post('/planner/generate', { ...form, interests: form.interests.map(id => INTERESTS.find(i => i.id === id)?.label || id) });
      const generatedPlan = res.data.data;
      setPlan(generatedPlan);
      toast.success('Trip plan ready!');

      // Auto-save the plan silently
      try {
        await api.post('/planner/save', {
          title: generatedPlan.tripTitle || `Trip to Jharkhand`,
          prompt_used: JSON.stringify(form),
          duration_days: form.days,
          destinations: generatedPlan.days?.flatMap((d: any) => d.locations || []) || [],
          itinerary: generatedPlan,
          raw_markdown: JSON.stringify(generatedPlan),
        });
        toast.success('✅ Plan auto-saved to your dashboard!', { duration: 2000 });
      } catch { /* silently fail — user can still save manually */ }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate plan');
    }
    setLoading(false);
  };

  const savePlan = async () => {
    try {
      await api.post('/planner/save', { title: plan.tripTitle, prompt_used: JSON.stringify(form), duration_days: form.days, destinations: plan.days?.flatMap((d: any) => d.locations) || [], itinerary: plan, raw_markdown: JSON.stringify(plan) });
      toast.success('Plan saved to your dashboard!');
    } catch { toast.error('Failed to save'); }
  };

  if (!isAuthenticated) {
    return (<><Helmet><title>AI Planner — JharExplore</title></Helmet><section className="min-h-screen flex items-center justify-center px-4 pt-20"><div className="text-center max-w-md"><Bot size={64} className="text-primary mx-auto mb-4" /><h2 className="font-heading text-2xl font-bold mb-2">Login Required</h2><p className="text-gray-500 mb-6">Sign in to use the AI Trip Planner</p><Link to="/login" className="btn-primary">Login</Link></div></section></>);
  }

  return (
    <>
      <Helmet><title>AI Trip Planner — JharExplore</title></Helmet>

      {/* Header */}
      <section className="pt-24 pb-8 px-4 bg-gradient-to-b from-dark to-primary/90 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3 mb-3">
            <Bot size={32} className="text-accent" /><h1 className="font-heading text-3xl md:text-4xl font-bold">AI Trip Planner</h1>
          </motion.div>
          <p className="text-white/70">Get a hyper-personalised Jharkhand itinerary powered by JharkhandAI</p>
        </div>
      </section>

      <section className="py-8 px-4 max-w-5xl mx-auto">
        {!plan ? (
          /* ─── FORM ─── */
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={generate} className="bg-white rounded-2xl shadow-card p-6 md:p-8 space-y-6">
            {/* Row 1: Origin + Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5"><MapPin size={14} className="inline mr-1" />Origin City</label><input required className="input-field" placeholder="e.g. Kolkata, Delhi, Mumbai" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5"><IndianRupee size={14} className="inline mr-1" />Total Budget (₹)</label><input required type="number" min={5000} step={1000} className="input-field" value={form.budget} onChange={e => setForm({...form, budget: parseInt(e.target.value) || 0})} /></div>
            </div>
            {/* Row 2: Days + Travelers + Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5"><Calendar size={14} className="inline mr-1" />Days</label><input required type="number" min={1} max={14} className="input-field" value={form.days} onChange={e => setForm({...form, days: parseInt(e.target.value) || 1})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5"><Users size={14} className="inline mr-1" />Travelers</label><input required type="number" min={1} max={20} className="input-field" value={form.travelers} onChange={e => setForm({...form, travelers: parseInt(e.target.value) || 1})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5"><Calendar size={14} className="inline mr-1" />Travel Dates</label><input className="input-field" placeholder="e.g. October 2026" value={form.travelDates} onChange={e => setForm({...form, travelDates: e.target.value})} /></div>
            </div>
            {/* Travel Style */}
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Travel Style</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{STYLES.map(s => (
                <button type="button" key={s.value} onClick={() => setForm({...form, travelStyle: s.value})} className={cn('p-4 rounded-xl border-2 text-left transition-all', form.travelStyle === s.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300')}>
                  <span className="text-2xl">{s.icon}</span><h4 className="font-semibold mt-1">{s.label}</h4><p className="text-xs text-gray-500">{s.desc}</p>
                </button>
              ))}</div>
            </div>
            {/* Interests */}
            <div><label className="block text-sm font-medium text-gray-700 mb-2"><Sparkles size={14} className="inline mr-1" />Interests (select at least 1)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{INTERESTS.map(i => (
                <button type="button" key={i.id} onClick={() => toggleInterest(i.id)} className={cn('p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2', form.interests.includes(i.id) ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300')}>
                  <span className="text-xl">{i.icon}</span><span className="text-sm font-medium">{i.label}</span>
                </button>
              ))}</div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-4 text-lg flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={20} className="animate-spin" /> Generating your plan...</> : <><Sparkles size={20} /> Generate My Trip Plan</>}
            </button>
          </motion.form>
        ) : (
          /* ─── RESULTS ─── */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header card */}
            <div className="bg-gradient-to-br from-dark via-dark-100 to-primary/70 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div><p className="text-accent text-sm font-semibold uppercase tracking-wider mb-1">Your AI Trip Plan</p><h2 className="font-heading text-2xl md:text-3xl font-bold">{plan.tripTitle}</h2></div>
                  <div className="flex gap-2">
                    <button onClick={savePlan} className="btn-accent !py-2 flex items-center gap-2 text-sm"><Save size={16} /> Save</button>
                    <button onClick={() => setPlan(null)} className="btn-ghost !text-white/70 !py-2 text-sm">New Plan</button>
                  </div>
                </div>
                <p className="text-white/70 mt-3 max-w-2xl">{plan.summary}</p>
                <div className={cn('inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-pill text-sm font-medium', plan.budgetHonesty?.includes('Comfortable') ? 'bg-green-500/20 text-green-300' : plan.budgetHonesty?.includes('Tight but') ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300')}>
                  {plan.budgetHonesty?.includes('Comfortable') ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{plan.budgetHonesty}
                </div>
                {plan.minimumBudgetNeeded && <p className="text-white/50 text-xs mt-2">Estimated minimum: {formatCurrency(plan.minimumBudgetNeeded)}</p>}
              </div>
            </div>

            {/* Budget Insufficient Warning */}
            {plan.budgetHonesty?.includes('Insufficient') && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={24} className="text-red-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading text-lg font-bold text-red-700">Budget Insufficient</h3>
                    <p className="text-sm text-red-600 mt-1">Your budget of <strong>{formatCurrency(form.budget)}</strong> is below the estimated minimum of <strong>{formatCurrency(plan.minimumBudgetNeeded || 0)}</strong> for this trip.</p>
                    <p className="text-sm text-red-500 mt-2">The plan below shows what the trip would actually cost. Consider increasing your budget or reducing the number of days/travelers.</p>
                    <button onClick={() => { setPlan(null); setForm(f => ({...f, budget: plan.minimumBudgetNeeded || f.budget + 5000})); }} className="mt-3 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">Adjust Budget & Retry</button>
                  </div>
                </div>
              </div>
            )}

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
                <p className="text-sm text-gray-500 mt-2">Per person: <strong>{formatCurrency(plan.budgetBreakdown.perPersonCost || 0)}</strong></p>
                {plan.budgetBreakdown.savingTips?.length > 0 && (
                  <div className="mt-4 space-y-1">{plan.budgetBreakdown.savingTips.map((t: string, i: number) => (<p key={i} className="text-sm text-gray-600 flex items-start gap-2"><Lightbulb size={14} className="text-accent mt-0.5 shrink-0" />{t}</p>))}</div>
                )}
              </div>
            )}

            {/* Transport Options with Book buttons */}
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

            {/* Hotels with Book buttons */}
            {plan.accommodation?.recommended?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-heading text-lg font-semibold mb-4">🏨 Recommended Stays</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.accommodation.recommended.map((h: any, i: number) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-all">
                      <div className="flex items-center justify-between mb-1"><h4 className="font-semibold">{h.name}</h4><span className="text-xs text-gray-500">{h.rating}</span></div>
                      <p className="text-xs text-gray-500">{h.location}</p>
                      <p className="text-lg font-bold text-primary mt-1">{formatCurrency(h.pricePerNight || 0)}<span className="text-xs font-normal text-gray-400">/night</span></p>
                      {h.highlights && <p className="text-xs text-gray-500 mt-1">{h.highlights}</p>}
                      {h.bestFor && <p className="text-xs text-gray-400 italic">Best for: {h.bestFor}</p>}
                      <div className="flex gap-2 mt-3">
                        {h.bookingLink && <a href={h.bookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">🔗 Book Hotel</a>}
                        {h.phone && <a href={`tel:${h.phone}`} className="inline-flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">📞 {h.phone}</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-day itinerary */}
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
                  {plan.bestTimeToVisit && <div className="mt-4 p-3 bg-primary/5 rounded-xl"><p className="text-sm"><strong>Best time:</strong> {plan.bestTimeToVisit}</p></div>}
                </div>
              )}
            </div>

            {/* Emergency Contacts + Nearby Attractions */}
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
          </motion.div>
        )}
      </section>
    </>
  );
};

export default AiPlannerPage;
