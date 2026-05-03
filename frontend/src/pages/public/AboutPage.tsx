import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mountain, Droplets, Users, TreePine } from 'lucide-react';

const AboutPage: React.FC = () => (
  <>
    <Helmet><title>About — JharExplore</title></Helmet>
    <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-dark to-primary/90 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-5xl font-bold mb-4">About JharExplore</motion.h1>
        <p className="text-white/70">Your gateway to Jharkhand's untouched beauty</p>
      </div>
    </section>
    <section className="py-16 px-4 max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-card p-8 shadow-card">
        <h2 className="font-heading text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed">JharExplore promotes the rich heritage, natural beauty, and diverse experiences of Jharkhand. Our AI planner creates personalized itineraries while our booking system ensures comfortable stays.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: Mountain, title: 'Natural Beauty', desc: '30+ curated destinations', color: 'text-primary bg-primary/10' },
          { icon: Users, title: 'Tribal Heritage', desc: '32 indigenous communities', color: 'text-accent bg-accent/10' },
          { icon: Droplets, title: '100+ Waterfalls', desc: 'Magnificent falls in eastern India', color: 'text-blue-600 bg-blue-50' },
          { icon: TreePine, title: '29% Forest Cover', desc: 'Dense Sal and bamboo forests', color: 'text-green-600 bg-green-50' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-card p-6 shadow-card flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}><item.icon size={24} /></div>
            <div><h3 className="font-heading font-semibold mb-1">{item.title}</h3><p className="text-sm text-gray-600">{item.desc}</p></div>
          </motion.div>
        ))}
      </div>
    </section>
  </>
);

export default AboutPage;
