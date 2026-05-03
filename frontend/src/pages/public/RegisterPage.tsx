import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet><title>Register — JharExplore</title></Helmet>
      <section className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10 bg-surface tribal-pattern">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-2xl shadow-card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-4">
              <span className="text-white font-heading font-bold text-2xl">J</span>
            </div>
            <h1 className="font-heading text-2xl font-bold">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join JharExplore and start exploring</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input required className="input-field" placeholder="Full Name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
            <input required type="email" className="input-field" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <input className="input-field" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required minLength={6} className="input-field !pr-12" placeholder="Password (6+ chars)" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><EyeOff size={18} /></button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? 'Creating...' : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </section>
    </>
  );
};

export default RegisterPage;
