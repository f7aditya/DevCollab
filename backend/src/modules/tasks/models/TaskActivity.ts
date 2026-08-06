import mongoose, { Document, Schema } from 'mongoose';

export const ACTIVITY_ACTIONS = ['CREATED', 'UPDATED', 'STATUS_CHANGED', 'ASSIGNEE_CHANGED', 'COMMENT_ADDED'] as const;
export type ActivityAction = typeof ACTIVITY_ACTIONS[number];

export interface ITaskActivity extends Document {
  taskId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  action: ActivityAction;
  details?: string;
  createdAt: Date;
}

const taskActivitySchema = new Schema<ITaskActivity>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: Object.values(ACTIVITY_ACTIONS),
      required: true
    },
    details: {
      type: String
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TaskActivity = mongoose.model<ITaskActivity>('TaskActivity', taskActivitySchema);
