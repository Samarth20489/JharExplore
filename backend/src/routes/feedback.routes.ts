import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { adminAuth } from '../middleware/adminAuth';
import { validate } from '../middleware/validate';
import { contactRateLimiter } from '../middleware/rateLimiter';
import { createFeedbackSchema, contactSchema } from '../schemas/feedback.schema';
import * as feedbackCtrl from '../controllers/feedback.controller';

const router = Router();

// Public
router.get('/', feedbackCtrl.getApprovedFeedback);

// User
router.post('/', authenticate, validate(createFeedbackSchema), feedbackCtrl.submitFeedback);
router.get('/my-reviews', authenticate, feedbackCtrl.getMyFeedback);
router.put('/:id', authenticate, feedbackCtrl.editOwnFeedback);
router.delete('/:id', authenticate, feedbackCtrl.deleteOwnFeedback);

export const adminFeedbackRouter = Router();
adminFeedbackRouter.get('/', adminAuth(), feedbackCtrl.adminListFeedback);
adminFeedbackRouter.patch('/:id/approve', adminAuth(), feedbackCtrl.approveFeedback);
adminFeedbackRouter.delete('/:id', adminAuth(), feedbackCtrl.adminDeleteFeedback);

export const contactRouter = Router();
contactRouter.post('/', contactRateLimiter, validate(contactSchema), feedbackCtrl.submitContact);

export default router;
