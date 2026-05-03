import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Building2, Map, Star, User, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const UserDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold mb-4">Please Login</h2>
          <Link to="/login" className="btn-primary">Login to Dashboard</Link>
        </div>
      </section>
    );
  }

  const cards = [
    { icon: Bot, title: 'AI Trip Planner', desc: 'Get AI-powered itineraries', path: '/dashboard/planner', color: 'from-accent to-terracotta' },
    { icon: Building2, title: 'Book Hotel', desc: 'Browse & book accommodations', path: '/hotels', color: 'from-primary to-primary-light' },
    { icon: Map, title: 'Saved Plans', desc: 'Your saved trip plans', path: '/dashboard/plans', color: 'from-blue-500 to-cyan-400' },
    { icon: Star, title: 'My Reviews', desc: 'Reviews you have posted', path: '/dashboard/reviews', color: 'from-purple-500 to-pink-400' },
  ];

  return (
    <>
      <Helmet><title>Dashboard — JharExplore</title></Helmet>
      <section className="pt-24 pb-8 px-4 bg-gradient-to-b from-dark to-primary/90 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">Welcome, {user?.full_name || 'Traveler'}!</h1>
              <p className="text-white/70 text-sm">{user?.email}</p>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={card.path} className="group block bg-white rounded-card p-6 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                  <card.icon size={24} className="text-white" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-1">{card.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{card.desc}</p>
                <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open <ArrowRight size={14} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
};

export default UserDashboard;
