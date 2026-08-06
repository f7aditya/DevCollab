import { api } from "@/lib/api";

export type NotificationType = "SYSTEM" | "TASK" | "CHAT" | "POST" | "JOB";

export interface Notification {
  _id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get(`/notifications`);
  return response.data.notifications;
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  await api.patch(`/notifications/${notificationId}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
  await api.patch(`/notifications/read-all`);
};
