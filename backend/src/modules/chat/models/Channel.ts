import mongoose, { Document, Schema } from 'mongoose';

export interface IChannel extends Document {
  projectId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true,
      index: true
    },
    name: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 2, 
      maxlength: 50,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Channel name can only contain lowercase letters, numbers, and hyphens']
    },
    description: { 
      type: String, 
      trim: true,
      maxlength: 500,
      default: ''
    }
  },
  { timestamps: true }
);

// Prevent duplicate channel names within the same project
channelSchema.index({ projectId: 1, name: 1 }, { unique: true });

export const Channel = mongoose.model<IChannel>('Channel', channelSchema);
