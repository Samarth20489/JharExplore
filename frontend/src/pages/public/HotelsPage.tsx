import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Search, Building2, Tent, Home, TreePine, BedDouble, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, cn } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PROPERTY_TYPES = [
  { value: '', label: 'All', icon: <Building2 size={15} /> },
  { value: 'hotel', label: 'Hotels', icon: <Building2 size={15} /> },
  { value: 'hostel', label: 'Hostels & Dorms', icon: <BedDouble size={15} /> },
  { value: 'homestay', label: 'Homestays', icon: <Home size={15} /> },
  { value: 'forest-rest-house', label: 'Forest Rest Houses', icon: <TreePine size={15} /> },
];

const HotelsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const activeType = searchParams.get('type') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['hotels', activeType, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeType) params.set('property_type', activeType);
      if (searchTerm) params.set('search', searchTerm);
      params.set('limit', '50');
      const res = await api.get(`/hotels?${params}`);
      return res.data;
    },
  });
  const hotels = data?.data || [];

  return (
    <>
      <Helmet>
        <title>Hotels & Stays — JharExplore</title>
        <meta name="description" content="Find hotels, hostels, homestays, and forest rest houses near Jharkhand's best tourist destinations." />
      </Helmet>

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-dark to-primary/90 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Find Your Stay
          </motion.h1>
          <p className="text-white/70 max-w-xl mx-auto mb-8">Hotels, hostels, homestays, and forest lodges — find the perfect accommodation for your Jharkhand trip.</p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary-light/50"
            />
          </div>
        </div>
      </section>

      {/* Property Type Tabs */}
      <div className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-lg border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => t.value ? setSearchParams({ type: t.value }) : setSearchParams({})}
                className={cn(
                  'px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5',
                  activeType === t.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        {isLoading ? <LoadingSpinner text="Loading stays..." /> : hotels.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-heading text-2xl font-semibold mb-2">No stays found</h3>
            <p className="text-gray-500">Try changing your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel: any, i: number) => (
              <motion.div key={hotel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/hotels/${hotel.slug}`} className="group block bg-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 border border-gray-100">
                  <div className="relative h-48 overflow-hidden">
                    <img src={hotel.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {/* Property type badge */}
                    <span className={cn(
                      'absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg capitalize',
                      hotel.property_type === 'hostel' ? 'bg-blue-500 text-white' :
                      hotel.property_type === 'homestay' ? 'bg-amber-500 text-white' :
                      hotel.property_type === 'forest-rest-house' ? 'bg-green-600 text-white' :
                      'bg-white/90 text-primary'
                    )}>
                      {hotel.property_type === 'forest-rest-house' ? '🌲 Forest Lodge' : hotel.property_type === 'hostel' ? '🛏️ Hostel' : hotel.property_type === 'homestay' ? '🏠 Homestay' : `${hotel.star_rating || 3}★ Hotel`}
                    </span>
                    {hotel.best_for && <span className="absolute bottom-3 left-3 text-[10px] bg-black/60 text-white px-2 py-1 rounded-lg">{hotel.best_for}</span>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">{hotel.name}</h3>
                    <p className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin size={14} />{hotel.district}</p>

                    {/* Amenities */}
                    {hotel.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {hotel.amenities.slice(0, 4).map((a: string, j: number) => (
                          <span key={j} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{a}</span>
                        ))}
                        {hotel.amenities.length > 4 && <span className="text-[10px] text-gray-400">+{hotel.amenities.length - 4}</span>}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div>
                        {hotel.property_type === 'hostel' && hotel.price_per_bed ? (
                          <div>
                            <span className="text-lg font-bold text-primary">{formatCurrency(hotel.price_per_bed)}<span className="text-xs font-normal text-gray-500">/bed</span></span>
                            <span className="text-xs text-gray-400 ml-1">· Room {formatCurrency(hotel.price_per_night)}</span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-primary">{formatCurrency(hotel.price_per_night)}<span className="text-xs font-normal text-gray-500">/night</span></span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {hotel.avg_rating > 0 && <span className="flex items-center gap-1 text-sm"><Star size={14} className="fill-accent text-accent" />{Number(hotel.avg_rating).toFixed(1)}</span>}
                        <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"><ArrowRight size={14} /></span>
                      </div>
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

export default HotelsPage;
