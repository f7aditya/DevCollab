import { Request, Response } from 'express';
import { catchAsync } from '../../../core/utils/catchAsync';
import { NotificationService } from '../services/notification.service';

export const NotificationController = {
  getNotifications: catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const notifications = await NotificationService.getUserNotifications(userId, limit);
    
    res.status(200).json({
      success: true,
      data: { notifications }
    });
  }),

  markAsRead: catchAsync(async (req: Request, res: Response) => {
    await NotificationService.markAsRead(req.params.notificationId as string, (req.user as any).id);
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: null
    });
  }),

  markAllAsRead: catchAsync(async (req: Request, res: Response) => {
    await NotificationService.markAllAsRead((req.user as any).id);
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: null
    });
  })
};
