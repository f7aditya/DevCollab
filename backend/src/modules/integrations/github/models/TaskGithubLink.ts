import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITaskGithubLink extends Document {
  taskId: Types.ObjectId;
  projectId: Types.ObjectId;
  
  githubType: 'ISSUE' | 'PULL_REQUEST' | 'COMMIT';
  githubId: string;
  githubNumber: number;
  
  url: string;
  title: string;
  status: 'open' | 'closed' | 'merged' | 'draft';
  
  linkedBy?: Types.ObjectId; // Optional if auto-linked by webhook
  createdAt: Date;
  updatedAt: Date;
}

const taskGithubLinkSchema = new Schema<ITaskGithubLink>(
  {
    taskId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Task', 
      required: true,
      index: true
    },
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true,
      index: true
    },
    githubType: { 
      type: String, 
      enum: ['ISSUE', 'PULL_REQUEST', 'COMMIT'], 
      required: true 
    },
    githubId: { type: String, required: true },
    githubNumber: { type: Number, required: true },
    url: { type: String, required: true },
    title: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['open', 'closed', 'merged', 'draft'], 
      required: true 
    },
    linkedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { timestamps: true }
);

taskGithubLinkSchema.index({ taskId: 1, githubType: 1, githubId: 1 }, { unique: true });

export const TaskGithubLink = mongoose.model<ITaskGithubLink>('TaskGithubLink', taskGithubLinkSchema);
