import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../services/api';
import { useAdminStore } from '../../store/adminStore';

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAdmin } = useAdminStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminApi.post('/admin/login', { username, password });
      const { admin, token } = res.data.data;
      setAdmin(admin, token);
      toast.success('Admin login successful');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet><title>Admin Login — JharExplore</title></Helmet>
      <section className="min-h-screen flex items-center justify-center px-4 bg-dark-200">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-dark-50 rounded-2xl shadow-2xl p-8 border border-white/5">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
              <Shield size={28} className="text-white" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">JharExplore Management</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input required className="w-full px-4 py-3 bg-dark-300 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required className="w-full px-4 py-3 bg-dark-300 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 pr-12" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </section>
    </>
  );
};

export default AdminLoginPage;
