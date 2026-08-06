import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  channelId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    channelId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Channel', 
      required: true,
      index: true
    },
    senderId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    content: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 1, 
      maxlength: 5000 
    }
  },
  { timestamps: true }
);

// Optimize for fetching paginated messages in a specific channel ordered by time
messageSchema.index({ channelId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
