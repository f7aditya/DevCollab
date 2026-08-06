import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  projectId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
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
      maxlength: 200 
    },
    content: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 1, 
      maxlength: 10000 
    },
    tags: {
      type: [{ type: String, trim: true, maxlength: 30 }],
      validate: [(val: string[]) => val.length <= 10, 'A post can have a maximum of 10 tags']
    }
  },
  { timestamps: true }
);

postSchema.index({ projectId: 1, createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', postSchema);
