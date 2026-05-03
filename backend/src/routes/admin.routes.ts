import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { validate } from '../middleware/validate';
import { strictRateLimiter } from '../middleware/rateLimiter';
import { adminLoginSchema } from '../schemas/auth.schema';
import * as adminCtrl from '../controllers/admin.controller';

const router = Router();

// Auth
router.post('/login', strictRateLimiter, validate(adminLoginSchema), adminCtrl.adminLogin);
router.get('/me', adminAuth(), adminCtrl.getAdminMe);
router.post('/seed', adminCtrl.seedAdmin);

// Dashboard & Stats
router.get('/dashboard/stats', adminAuth(), adminCtrl.getDashboardStats);
router.get('/stats/content-health', adminAuth(), adminCtrl.getContentHealth);

// Review Moderation
router.get('/reviews', adminAuth(), adminCtrl.adminListReviews);
router.patch('/reviews/:id/approve', adminAuth(), adminCtrl.approveReview);
router.patch('/reviews/:id/reject', adminAuth(), adminCtrl.rejectReview);
router.patch('/reviews/:id/flag', adminAuth(), adminCtrl.toggleFlagReview);
router.delete('/reviews/:id', adminAuth(), adminCtrl.adminDeleteReview);

// Users
router.get('/users', adminAuth(), adminCtrl.listUsers);
router.patch('/users/:id/suspend', adminAuth(['super_admin']), adminCtrl.suspendUser);
router.patch('/users/:id/reactivate', adminAuth(['super_admin']), adminCtrl.reactivateUser);

// Announcements
router.get('/announcements', adminAuth(), adminCtrl.adminListAnnouncements);
router.post('/announcements', adminAuth(), adminCtrl.createAnnouncement);
router.patch('/announcements/:id/toggle', adminAuth(), adminCtrl.toggleAnnouncement);
router.delete('/announcements/:id', adminAuth(), adminCtrl.deleteAnnouncement);

// Audit Log
router.get('/audit-log', adminAuth(), adminCtrl.getAuditLog);

// Contact Messages
router.get('/contact-messages', adminAuth(), adminCtrl.getContactMessages);
router.patch('/contact-messages/:id/resolve', adminAuth(), adminCtrl.resolveContactMessage);

export default router;
