import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => (
  <>
    <Helmet><title>404 — JharExplore</title></Helmet>
    <section className="min-h-screen flex items-center justify-center px-4 bg-surface">
      <div className="text-center">
        <span className="text-8xl font-heading font-bold gradient-text">404</span>
        <h2 className="font-heading text-2xl font-semibold mt-4 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2"><Home size={18} /> Back Home</Link>
      </div>
    </section>
  </>
);

export default NotFoundPage;
