import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MapPin, Star, ArrowRight, Compass, TreePine, Mountain, Droplets, Users, Bot, Building2, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { cn, formatCurrency, CATEGORIES } from '../../utils/helpers';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1432405972618-c6b0252f2880?w=1920&q=80',
  'https://images.unsplash.com/photo-1535338454528-1b5c8e9b20d3?w=1920&q=80',
];

const STATS = [
  { icon: MapPin, value: '30+', label: 'Destinations' },
  { icon: Building2, value: '50+', label: 'Hotels' },
  { icon: Users, value: '10K+', label: 'Happy Travelers' },
  { icon: Star, value: '4.8', label: 'Avg Rating' },
];

const HomePage: React.FC = () => {
  const [currentHero, setCurrentHero] = useState(0);

  const { data: featuredPlaces } = useQuery({
    queryKey: ['featured-places'],
    queryFn: async () => {
      const res = await api.get('/places?featured=true&limit=6');
      return res.data.data;
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Helmet>
        <title>JharExplore — Discover the Soul of Jharkhand</title>
        <meta name="description" content="Explore Jharkhand's stunning waterfalls, ancient temples, dense forests, and vibrant tribal culture. Plan your trip with AI-powered itineraries." />
      </Helmet>

      {/* HERO SECTION */}
      <section className="relative h-screen min-h-[700px] overflow-hidden">
        {/* Background Image Slideshow */}
        {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            className={cn(
              'absolute inset-0 bg-cover bg-center transition-opacity duration-1000',
              i === currentHero ? 'opacity-100' : 'opacity-0'
            )}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-hero" />
        
        {/* Tribal pattern overlay */}
        <div className="absolute inset-0 tribal-pattern opacity-20" />

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
              <Compass size={16} className="animate-spin" style={{ animationDuration: '8s' }} />
              Welcome to Jharkhand
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
          >
            Discover the
            <br />
            <span className="bg-gradient-to-r from-primary-light via-accent to-terracotta bg-clip-text text-transparent">
              Soul of Jharkhand
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed"
          >
            From thundering waterfalls to ancient temples, dense forests to vibrant tribal culture — 
            embark on an unforgettable journey through the heart of India.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/destinations" className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2 group">
              Explore Destinations
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/dashboard/planner" className="btn-outline !border-white !text-white hover:!bg-white hover:!text-dark text-lg !px-8 !py-4 flex items-center gap-2">
              <Bot size={20} />
              AI Trip Planner
            </Link>
          </motion.div>

          {/* Hero indicator dots */}
          <div className="absolute bottom-8 flex gap-2">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentHero(i)}
                className={cn('w-2.5 h-2.5 rounded-full transition-all', i === currentHero ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="relative -mt-16 z-10 max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <stat.icon size={24} className="text-primary" />
                </div>
                <span className="text-2xl md:text-3xl font-bold text-dark">{stat.value}</span>
                <span className="text-sm text-gray-500 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CATEGORY GRID */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="category-badge mb-4"
          >
            Explore by Category
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-heading"
          >
            What Awaits You
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-subheading"
          >
            From roaring waterfalls to sacred temples, explore the diverse landscapes of Jharkhand
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.slice(0, 5).map((cat, i) => (
            <motion.div
              key={cat.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/destinations?category=${cat.value}`}
                className="group block p-6 bg-white rounded-card text-center hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="font-medium text-dark text-sm">{cat.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED DESTINATIONS */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="category-badge mb-3">Featured</span>
              <h2 className="section-heading">Top Destinations</h2>
              <p className="text-gray-500 mt-2 max-w-lg">Handpicked destinations that showcase the best of Jharkhand's natural beauty and cultural heritage.</p>
            </div>
            <Link to="/destinations" className="hidden md:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
              View All <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featuredPlaces || []).map((place: any, i: number) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/destinations/${place.slug}`}
                  className="group block bg-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={place.thumbnail || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute top-3 left-3 category-badge !bg-white/90 !text-primary">
                      {CATEGORIES.find(c => c.value === place.category)?.icon} {place.category}
                    </span>
                    {place.avg_rating > 0 && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-sm">
                        <Star size={14} className="fill-accent text-accent" />
                        {Number(place.avg_rating).toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading font-semibold text-lg text-dark group-hover:text-primary transition-colors">{place.name}</h3>
                    <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin size={14} /> {place.district}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{place.short_description}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-primary font-medium bg-primary/5 px-2 py-1 rounded">
                        {place.best_time_to_visit?.split(' ')[0] || 'Year round'}
                      </span>
                      <span className="text-sm text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Explore <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <Link to="/destinations" className="md:hidden mt-8 btn-outline w-full flex items-center justify-center gap-2">
            View All Destinations <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* WHY JHARKHAND */}
      <section className="py-20 px-4 tribal-pattern">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="category-badge mb-3">Why Visit?</span>
            <h2 className="section-heading">Why Choose Jharkhand</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Droplets,
                title: 'Majestic Waterfalls',
                desc: 'Home to 100+ waterfalls including the iconic Hundru Falls, Jonha Falls, and Dassam Falls — each a masterpiece of nature.',
                color: 'from-blue-500 to-cyan-400',
              },
              {
                icon: TreePine,
                title: 'Rich Biodiversity',
                desc: 'Over 29% forest cover with national parks hosting tigers, elephants, leopards, and 500+ bird species in pristine habitats.',
                color: 'from-primary to-primary-light',
              },
              {
                icon: Users,
                title: 'Tribal Heritage',
                desc: '32 tribal communities with vibrant festivals like Sarhul, Karma, and Tusu — living traditions spanning millennia.',
                color: 'from-accent to-terracotta',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group p-8 bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5', item.color)}>
                  <item.icon size={28} className="text-white" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-dark mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI PLANNER CTA */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark via-dark-100 to-primary/80 p-10 md:p-16 text-white"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Bot size={24} className="text-accent" />
                  <span className="text-accent font-semibold text-sm uppercase tracking-wider">AI-Powered</span>
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Plan Your Perfect Trip with AI</h2>
                <p className="text-white/70 leading-relaxed mb-6">
                  Let our AI assistant JharAI create a personalized day-by-day itinerary for your Jharkhand adventure. 
                  Just tell us your interests and duration!
                </p>
                <Link to="/dashboard/planner" className="btn-accent inline-flex items-center gap-2 !text-lg">
                  Try AI Planner <ArrowRight size={20} />
                </Link>
              </div>
              <div className="w-full md:w-72 h-48 md:h-64 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  JharAI is ready
                </div>
                <div className="flex-1 space-y-2">
                  <div className="bg-white/10 rounded-xl px-4 py-2 text-sm">Plan a 3-day waterfall tour</div>
                  <div className="bg-primary/30 rounded-xl px-4 py-2 text-sm text-white/80">
                    <span className="typewriter-cursor">Day 1: Start at Hundru Falls...</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
