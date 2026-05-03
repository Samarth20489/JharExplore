import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import placesRoutes, { adminPlacesRouter } from './places.routes';
import hotelsRoutes, { adminHotelsRouter } from './hotels.routes';
import bookingsRoutes, { adminBookingsRouter } from './bookings.routes';
import plannerRoutes from './planner.routes';
import feedbackRoutes, { adminFeedbackRouter, contactRouter } from './feedback.routes';
import { getActiveAnnouncements } from '../controllers/admin.controller';

const router = Router();

// Public + User routes
router.use('/auth', authRoutes);
router.use('/places', placesRoutes);
router.use('/hotels', hotelsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/planner', plannerRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/contact', contactRouter);

// Public announcements
router.get('/announcements/active', getActiveAnnouncements);

// Admin routes
router.use('/admin', adminRoutes);
router.use('/admin/places', adminPlacesRouter);
router.use('/admin/hotels', adminHotelsRouter);
router.use('/admin/bookings', adminBookingsRouter);
router.use('/admin/feedback', adminFeedbackRouter);

export default router;
