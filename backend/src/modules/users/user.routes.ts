import { Router } from 'express';
import { UserController } from './controllers/user.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/me', UserController.getMe);
router.patch('/me', UserController.updateMe);

export { router as userRouter };
