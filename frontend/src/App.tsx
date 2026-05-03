import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ScrollToTop from './components/common/ScrollToTop';

// Lazy load pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const DestinationsPage = lazy(() => import('./pages/public/DestinationsPage'));
const PlaceDetailPage = lazy(() => import('./pages/public/PlaceDetailPage'));
const HotelsPage = lazy(() => import('./pages/public/HotelsPage'));
const HotelDetailPage = lazy(() => import('./pages/public/HotelDetailPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));

// User pages
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const AiPlannerPage = lazy(() => import('./pages/user/AiPlannerPage'));
const SavedPlansPage = lazy(() => import('./pages/user/SavedPlansPage'));
const ViewPlanPage = lazy(() => import('./pages/user/ViewPlanPage'));
const MyReviewsPage = lazy(() => import('./pages/user/MyReviewsPage'));

// Admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPlacesPage = lazy(() => import('./pages/admin/AdminPlacesPage'));
const AdminHotelsPage = lazy(() => import('./pages/admin/AdminHotelsPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminContentHealthPage = lazy(() => import('./pages/admin/AdminContentHealthPage'));
const AdminAuditLogPage = lazy(() => import('./pages/admin/AdminAuditLogPage'));
const AdminAnnouncementsPage = lazy(() => import('./pages/admin/AdminAnnouncementsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              {/* Public & User Routes (with Navbar + Footer) */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/destinations/:slug" element={<PlaceDetailPage />} />
                <Route path="/hotels" element={<HotelsPage />} />
                <Route path="/hotels/:slug" element={<HotelDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* User */}
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/dashboard/planner" element={<AiPlannerPage />} />
                <Route path="/dashboard/plans" element={<SavedPlansPage />} />
                <Route path="/dashboard/plans/:id" element={<ViewPlanPage />} />
                <Route path="/dashboard/reviews" element={<MyReviewsPage />} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin Login (standalone — no sidebar) */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Admin routes (with sidebar layout, no Navbar/Footer) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="places" element={<AdminPlacesPage />} />
                <Route path="hotels" element={<AdminHotelsPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="content-health" element={<AdminContentHealthPage />} />
                <Route path="audit-log" element={<AdminAuditLogPage />} />
                <Route path="announcements" element={<AdminAnnouncementsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

/* Wrapper for public routes: Navbar + Footer */
import { Outlet } from 'react-router-dom';
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
