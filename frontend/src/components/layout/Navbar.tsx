import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MapPin, Building2, Bot, Info, Phone, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/helpers';

const NAV_LINKS = [
  { path: '/', label: 'Home', icon: null },
  { path: '/destinations', label: 'Destinations', icon: MapPin },
  { path: '/hotels', label: 'Hotels', icon: Building2 },
  { path: '/about', label: 'About', icon: Info },
  { path: '/contact', label: 'Contact', icon: Phone },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setIsMobileOpen(false), [location]);

  const isHome = location.pathname === '/';
  const showTransparent = isHome && !isScrolled;

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          showTransparent
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-lg shadow-md border-b border-gray-100'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg group-hover:shadow-glow-primary transition-shadow duration-300">
                <span className="text-white font-heading font-bold text-lg">J</span>
              </div>
              <div>
                <h1 className={cn('text-xl font-heading font-bold transition-colors', showTransparent ? 'text-white' : 'text-dark')}>
                  Jhar<span className="text-primary-light">Explore</span>
                </h1>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                    location.pathname === link.path
                      ? showTransparent
                        ? 'bg-white/20 text-white'
                        : 'bg-primary/10 text-primary'
                      : showTransparent
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/dashboard/planner"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      showTransparent
                        ? 'bg-accent/90 text-white hover:bg-accent'
                        : 'bg-accent text-white hover:bg-accent-600'
                    )}
                  >
                    <Bot size={16} />
                    AI Planner
                  </Link>
                  <Link
                    to="/dashboard"
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      showTransparent
                        ? 'text-white/80 hover:bg-white/10'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={16} className="text-primary" />
                    </div>
                    <span className="hidden lg:inline">{user?.full_name || 'Dashboard'}</span>
                  </Link>
                  <button
                    onClick={() => { clearAuth(); }}
                    className={cn(
                      'p-2 rounded-lg transition-all',
                      showTransparent ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-red-500'
                    )}
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      showTransparent ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm !py-2"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={cn('md:hidden p-2 rounded-lg', showTransparent ? 'text-white' : 'text-dark')}
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-40 bg-white shadow-xl border-b md:hidden"
          >
            <div className="px-4 py-6 space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    location.pathname === link.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {link.icon && <link.icon size={18} />}
                  {link.label}
                </Link>
              ))}
              <div className="border-t pt-4 mt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard/planner" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/10 text-accent-700 font-medium">
                      <Bot size={18} /> AI Trip Planner
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50">
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <button onClick={() => clearAuth()} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full text-left">
                      <LogOut size={18} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-3 text-center rounded-xl border border-primary text-primary font-medium">Login</Link>
                    <Link to="/register" className="block px-4 py-3 text-center rounded-xl bg-primary text-white font-medium">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
