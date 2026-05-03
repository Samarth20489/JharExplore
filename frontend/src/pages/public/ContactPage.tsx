import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch { toast.error('Failed to send message'); }
    setLoading(false);
  };

  return (
    <>
      <Helmet><title>Contact — JharExplore</title></Helmet>
      <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-dark to-primary/90 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-5xl font-bold mb-4">Contact Us</motion.h1>
          <p className="text-white/70">Have questions? We'd love to hear from you.</p>
        </div>
      </section>
      <section className="py-16 px-4 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          {[
            { icon: MapPin, title: 'Address', text: 'Jharkhand Tourism, Ranchi 834001' },
            { icon: Phone, title: 'Phone', text: '+91 651-2400-100' },
            { icon: Mail, title: 'Email', text: 'info@jharexplore.in' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 bg-white rounded-card p-5 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><item.icon size={20} className="text-primary" /></div>
              <div><h3 className="font-semibold text-sm">{item.title}</h3><p className="text-sm text-gray-600">{item.text}</p></div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-card p-8 shadow-card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required className="input-field" placeholder="Your Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input required type="email" className="input-field" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input-field" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <input required className="input-field" placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
          </div>
          <textarea required rows={5} className="input-field resize-none" placeholder="Your message..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
          </button>
        </form>
      </section>
    </>
  );
};

export default ContactPage;
