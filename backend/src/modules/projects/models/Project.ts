import mongoose, { Document, Schema } from 'mongoose';

export const PROJECT_VISIBILITY = ['PUBLIC', 'PRIVATE'] as const;
export type ProjectVisibility = typeof PROJECT_VISIBILITY[number];

export const PROJECT_STATUS = ['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as const;
export type ProjectStatus = typeof PROJECT_STATUS[number];

const urlRegex = /^https?:\/\/.+/;

export interface IProject extends Document {
  name: string;
  description: string;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  techStack: string[];
  tags: string[];
  links?: {
    github?: string;
    website?: string;
    documentation?: string;
  };
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 2, 
      maxlength: 100 
    },
    description: { 
      type: String, 
      required: true, 
      maxlength: 2000 
    },
    visibility: { 
      type: String, 
      enum: Object.values(PROJECT_VISIBILITY), 
      default: 'PUBLIC' 
    },
    status: { 
      type: String, 
      enum: Object.values(PROJECT_STATUS), 
      default: 'PLANNING' 
    },
    techStack: {
      type: [{ type: String, trim: true, maxlength: 50 }],
      validate: [(val: string[]) => val.length <= 20, 'Projects can have a maximum of 20 tech stack items']
    },
    tags: {
      type: [{ type: String, trim: true, maxlength: 30 }],
      validate: [(val: string[]) => val.length <= 10, 'Projects can have a maximum of 10 tags']
    },
    links: {
      github: { type: String, trim: true, match: [urlRegex, 'Invalid GitHub URL'] },
      website: { type: String, trim: true, match: [urlRegex, 'Invalid Website URL'] },
      documentation: { type: String, trim: true, match: [urlRegex, 'Invalid Documentation URL'] },
    },
    ownerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true // Crucial for performance
    },
  },
  { timestamps: true }
);

// Optimize frequent queries
projectSchema.index({ ownerId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ visibility: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
