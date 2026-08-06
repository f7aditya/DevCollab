import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskComment extends Document {
  taskId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskCommentSchema = new Schema<ITaskComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
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
      maxlength: 1000
    }
  },
  { timestamps: true }
);

export const TaskComment = mongoose.model<ITaskComment>('TaskComment', taskCommentSchema);
