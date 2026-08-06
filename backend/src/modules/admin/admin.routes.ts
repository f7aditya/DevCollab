import { Router } from 'express';
import { AdminController } from './controllers/admin.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

// In a real app, this should also use restrictTo('GLOBAL_ADMIN')
// For this demo platform, any authenticated user can view the analytics dashboard
router.use(protect);

router.get('/analytics', AdminController.getAnalytics);

export { router as adminRouter };
