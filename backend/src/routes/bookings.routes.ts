import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { adminAuth } from '../middleware/adminAuth';
import { validate } from '../middleware/validate';
import { createBookingSchema, cancelBookingSchema, updateBookingStatusSchema } from '../schemas/booking.schema';
import * as bookingsCtrl from '../controllers/bookings.controller';

const router = Router();

// User routes
router.post('/', authenticate, validate(createBookingSchema), bookingsCtrl.createBooking);
router.get('/my', authenticate, bookingsCtrl.getMyBookings);
router.get('/:id', authenticate, bookingsCtrl.getBookingById);
router.patch('/:id/cancel', authenticate, validate(cancelBookingSchema), bookingsCtrl.cancelBooking);

export const adminBookingsRouter = Router();
adminBookingsRouter.get('/', adminAuth(), bookingsCtrl.adminListBookings);
adminBookingsRouter.patch('/:id/status', adminAuth(), validate(updateBookingStatusSchema), bookingsCtrl.updateBookingStatus);

export default router;
