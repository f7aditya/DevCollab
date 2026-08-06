import mongoose, { Document, Schema } from 'mongoose';

export const APPLICATION_STATUS = ['PENDING', 'ACCEPTED', 'REJECTED'] as const;
export type ApplicationStatus = typeof APPLICATION_STATUS[number];

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  coverLetter: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    jobId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Job', 
      required: true,
      index: true
    },
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true 
    },
    applicantId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    coverLetter: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: 10,
      maxlength: 3000
    },
    status: { 
      type: String, 
      enum: Object.values(APPLICATION_STATUS), 
      default: 'PENDING' 
    }
  },
  { timestamps: true }
);

// Prevent a user from applying to the same job twice
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
applicationSchema.index({ projectId: 1, status: 1 });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
