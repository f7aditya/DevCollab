import mongoose, { Document, Schema } from 'mongoose';

export const JOB_STATUS = ['OPEN', 'CLOSED', 'DRAFT'] as const;
export type JobStatus = typeof JOB_STATUS[number];

export interface IJob extends Document {
  projectId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requirements: string[];
  status: JobStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true,
      index: true
    },
    authorId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    title: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 2, 
      maxlength: 150 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 5000
    },
    requirements: {
      type: [{ type: String, trim: true, maxlength: 200 }],
      validate: [(val: string[]) => val.length <= 20, 'Maximum 20 requirements allowed']
    },
    status: { 
      type: String, 
      enum: Object.values(JOB_STATUS), 
      default: 'OPEN',
      index: true
    },
    tags: {
      type: [{ type: String, trim: true, maxlength: 30 }],
      validate: [(val: string[]) => val.length <= 10, 'Maximum 10 tags allowed']
    }
  },
  { timestamps: true }
);

jobSchema.index({ projectId: 1, status: 1, createdAt: -1 });

export const Job = mongoose.model<IJob>('Job', jobSchema);
