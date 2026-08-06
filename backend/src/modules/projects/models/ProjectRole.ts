import mongoose, { Document, Schema } from 'mongoose';

export const PROJECT_ROLES = ['OWNER', 'ADMIN', 'MAINTAINER', 'MEMBER', 'VIEWER'] as const;
export type ProjectRoleType = typeof PROJECT_ROLES[number];

export interface IProjectRole extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: ProjectRoleType;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectRoleSchema = new Schema<IProjectRole>(
  {
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true,
      index: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    role: { 
      type: String, 
      enum: Object.values(PROJECT_ROLES), 
      default: 'MEMBER' 
    },
    joinedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Crucial: A user can only have one role per project. 
// This compound index prevents duplicate memberships.
projectRoleSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export const ProjectRole = mongoose.model<IProjectRole>('ProjectRole', projectRoleSchema);
