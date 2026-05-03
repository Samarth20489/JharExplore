import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Camera, MessageCircle, Video, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white">
      {/* Tribal art divider */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-terracotta" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-white font-heading font-bold text-lg">J</span>
              </div>
              <span className="text-xl font-heading font-bold">
                Jhar<span className="text-primary-light">Explore</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover the soul of Jharkhand — waterfalls, forests, tribal art, 
              heritage sites, and authentic cultural experiences.
            </p>
            <div className="flex gap-3">
              {[Globe, Camera, MessageCircle, Video].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/destinations', label: 'Destinations' },
                { to: '/hotels', label: 'Hotels' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
                { to: '/dashboard/planner', label: 'AI Trip Planner' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-primary-light transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Top Destinations</h3>
            <ul className="space-y-2.5">
              {['Hundru Falls', 'Betla National Park', 'Deoghar', 'Netarhat', 'Dalma Sanctuary'].map((place) => (
                <li key={place}>
                  <Link to={`/destinations/${place.toLowerCase().replace(/\s+/g, '-')}`} className="text-gray-400 hover:text-primary-light transition-colors text-sm">
                    {place}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin size={16} className="text-primary-light mt-0.5 shrink-0" />
                Jharkhand Tourism, Ranchi, Jharkhand 834001
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone size={16} className="text-primary-light shrink-0" />
                +91 651-2400-100
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail size={16} className="text-primary-light shrink-0" />
                info@jharexplore.in
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} JharExplore. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-terracotta fill-terracotta" /> for Jharkhand
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
