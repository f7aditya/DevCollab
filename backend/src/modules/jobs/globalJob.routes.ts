import { Router } from 'express';
import { JobController } from './controllers/job.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', JobController.getAllJobs);
router.get('/applications/me', JobController.getMyApplications);

export { router as globalJobRouter };
