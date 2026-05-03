import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { validate } from '../middleware/validate';
import { createPlaceSchema, updatePlaceSchema } from '../schemas/place.schema';
import * as placesCtrl from '../controllers/places.controller';

const router = Router();

// Public routes
router.get('/', placesCtrl.listPlaces);
router.get('/:slug', placesCtrl.getPlaceBySlug);
router.get('/:id/nearby', placesCtrl.getNearbyPlaces);

export const adminPlacesRouter = Router();
adminPlacesRouter.get('/', adminAuth(), placesCtrl.adminListPlaces);
adminPlacesRouter.post('/', adminAuth(['admin', 'super_admin']), validate(createPlaceSchema), placesCtrl.createPlace);
adminPlacesRouter.put('/:id', adminAuth(), validate(updatePlaceSchema), placesCtrl.updatePlace);
adminPlacesRouter.delete('/:id', adminAuth(['super_admin']), placesCtrl.deletePlace);

export default router;
