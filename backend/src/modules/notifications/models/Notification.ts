import mongoose, { Document, Schema } from 'mongoose';

export const NOTIFICATION_TYPES = ['SYSTEM', 'TASK', 'CHAT', 'POST', 'JOB'] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    type: { 
      type: String, 
      enum: Object.values(NOTIFICATION_TYPES), 
      default: 'SYSTEM' 
    },
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    message: { 
      type: String, 
      required: true, 
      trim: true 
    },
    link: { 
      type: String 
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

// Optimize for fetching user's unread notifications
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
