import { Notification, INotification } from '../models/Notification';

export class NotificationService {
  static async getUserNotifications(userId: string, limit: number = 50): Promise<INotification[]> {
    return await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { read: true }
    );
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { recipientId: userId, read: false },
      { read: true }
    );
  }

  // Generic method to be called internally by other services (Tasks, Posts, etc)
  static async createNotification(data: {
    recipientId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
  }): Promise<void> {
    await Notification.create(data as any);
  }
}
