import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    postId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Post', 
      required: true,
      index: true
    },
    authorId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    content: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 1, 
      maxlength: 2000 
    }
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: 1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
