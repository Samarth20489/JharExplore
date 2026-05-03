import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Star, Search, ArrowRight, Filter } from 'lucide-react';
import api from '../../services/api';
import { cn, CATEGORIES } from '../../utils/helpers';

const DestinationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const activeCategory = searchParams.get('category') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['places', activeCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory) params.set('category', activeCategory);
      if (searchTerm) params.set('search', searchTerm);
      params.set('limit', '50');
      const res = await api.get(`/places?${params}`);
      return res.data;
    },
  });

  const places = data?.data || [];

  return (
    <>
      <Helmet>
        <title>Destinations — JharExplore</title>
        <meta name="description" content="Explore Jharkhand's stunning tourist destinations — waterfalls, heritage sites, wildlife sanctuaries, and more." />
      </Helmet>

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-dark to-primary/90 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Explore Destinations
          </motion.h1>
          <p className="text-white/70 max-w-xl mx-auto mb-8">Discover the diverse beauty of Jharkhand — from thundering waterfalls to ancient temples.</p>
          
          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary-light/50"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-lg border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            <button
              onClick={() => { setSearchParams({}); }}
              className={cn('px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-all', !activeCategory ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSearchParams({ category: cat.value })}
                className={cn('px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5', activeCategory === cat.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-card animate-pulse">
                <div className="h-52 bg-gray-200 rounded-t-card" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🏔️</span>
            <h3 className="font-heading text-2xl font-semibold text-dark mb-2">No destinations found</h3>
            <p className="text-gray-500">Try changing your search or category filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place: any, i: number) => (
              <motion.div key={place.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/destinations/${place.slug}`} className="group block bg-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className="relative h-52 overflow-hidden">
                    <img src={place.thumbnail || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute top-3 left-3 category-badge !bg-white/90 !text-primary">{CATEGORIES.find(c => c.value === place.category)?.icon} {place.category}</span>
                    {place.is_featured && <span className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded-lg">⭐ Featured</span>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading font-semibold text-lg text-dark group-hover:text-primary transition-colors">{place.name}</h3>
                    <p className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin size={14} />{place.district}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{place.short_description}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">{place.avg_rating > 0 && <><Star size={14} className="fill-accent text-accent" /><span className="text-sm font-medium">{Number(place.avg_rating).toFixed(1)}</span></>}</div>
                      <span className="text-sm text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">Explore <ArrowRight size={14} /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default DestinationsPage;
