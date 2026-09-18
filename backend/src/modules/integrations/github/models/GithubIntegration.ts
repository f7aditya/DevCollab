import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGithubIntegration extends Document {
  projectId: Types.ObjectId;
  repoOwner: string;
  repoName: string;
  githubRepoId: string;
  
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;

  webhookId?: string;
  webhookSecret: string;
  
  syncStatus: 'PENDING' | 'ACTIVE' | 'ERROR';
  lastSyncedAt?: Date;
  
  addedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const githubIntegrationSchema = new Schema<IGithubIntegration>(
  {
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true,
      index: true
    },
    repoOwner: { type: String, required: true, trim: true },
    repoName: { type: String, required: true, trim: true },
    githubRepoId: { type: String, required: true },
    
    // Stored encrypted via service layer before saving
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    tokenExpiresAt: { type: Date },

    webhookId: { type: String },
    webhookSecret: { type: String, required: true },
    
    syncStatus: { 
      type: String, 
      enum: ['PENDING', 'ACTIVE', 'ERROR'], 
      default: 'PENDING' 
    },
    lastSyncedAt: { type: Date },
    
    addedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }
  },
  { timestamps: true }
);

// Prevent linking the same repo to the same project twice
githubIntegrationSchema.index({ projectId: 1, githubRepoId: 1 }, { unique: true });

export const GithubIntegration = mongoose.model<IGithubIntegration>('GithubIntegration', githubIntegrationSchema);
