import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { validate } from '../middleware/validate';
import { createHotelSchema, updateHotelSchema, createRoomSchema } from '../schemas/hotel.schema';
import * as hotelsCtrl from '../controllers/hotels.controller';

const router = Router();

// Public
router.get('/', hotelsCtrl.listHotels);
router.get('/:slug', hotelsCtrl.getHotelBySlug);

export const adminHotelsRouter = Router();
adminHotelsRouter.get('/', adminAuth(), hotelsCtrl.adminListHotels);
adminHotelsRouter.post('/', adminAuth(), validate(createHotelSchema), hotelsCtrl.createHotel);
adminHotelsRouter.put('/:id', adminAuth(), validate(updateHotelSchema), hotelsCtrl.updateHotel);
adminHotelsRouter.delete('/:id', adminAuth(['super_admin']), hotelsCtrl.deleteHotel);
adminHotelsRouter.post('/:id/rooms', adminAuth(), validate(createRoomSchema), hotelsCtrl.addRoom);
adminHotelsRouter.put('/:hotelId/rooms/:roomId', adminAuth(), hotelsCtrl.updateRoom);
adminHotelsRouter.delete('/:hotelId/rooms/:roomId', adminAuth(), hotelsCtrl.deleteRoom);

export default router;
