import { Router } from 'express';
import { NotificationController } from './controllers/notification.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', NotificationController.getNotifications);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:notificationId/read', NotificationController.markAsRead);

export { router as notificationRouter };
