import mongoose, { Document, Schema } from 'mongoose';

export const TASK_STATUS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;
export type TaskStatus = typeof TASK_STATUS[number];

export const TASK_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type TaskPriority = typeof TASK_PRIORITY[number];

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  reporterId: mongoose.Types.ObjectId;
  assigneeId?: mongoose.Types.ObjectId;
  tags: string[];
  dueDate?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true,
      index: true
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
      trim: true,
      maxlength: 3000,
      default: ''
    },
    status: { 
      type: String, 
      enum: Object.values(TASK_STATUS), 
      default: 'TODO' 
    },
    priority: { 
      type: String, 
      enum: Object.values(TASK_PRIORITY), 
      default: 'MEDIUM' 
    },
    reporterId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    assigneeId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    tags: {
      type: [{ type: String, trim: true, maxlength: 30 }],
      validate: [(val: string[]) => val.length <= 10, 'Tasks can have a maximum of 10 tags']
    },
    dueDate: { 
      type: Date 
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Compound index to quickly fetch a project's tasks filtered by status (crucial for Kanban boards)
taskSchema.index({ projectId: 1, status: 1, order: 1 });

// Optimize frequent queries
taskSchema.index({ projectId: 1 });
taskSchema.index({ assigneeId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
