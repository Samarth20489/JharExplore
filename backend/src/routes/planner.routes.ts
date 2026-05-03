import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { generatePlanSchema, savePlanSchema } from '../schemas/plan.schema';
import * as plannerCtrl from '../controllers/planner.controller';

const router = Router();

router.post('/generate', authenticate, aiRateLimiter, validate(generatePlanSchema), plannerCtrl.generatePlan);
router.post('/save', authenticate, validate(savePlanSchema), plannerCtrl.savePlan);
router.get('/my-plans', authenticate, plannerCtrl.getMyPlans);
router.get('/my-plans/:id', authenticate, plannerCtrl.getPlanById);
router.patch('/my-plans/:id/bookmark', authenticate, plannerCtrl.toggleBookmark);
router.delete('/my-plans/:id', authenticate, plannerCtrl.deletePlan);

export default router;
