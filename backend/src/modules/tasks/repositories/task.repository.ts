import { Task, ITask } from '../models/Task';
import { CreateTaskInput, UpdateTaskInput } from '../dtos/task.schema';

export const TaskRepository = {
  async create(projectId: string, reporterId: string, data: CreateTaskInput): Promise<ITask> {
    const task = new Task({ ...data, projectId, reporterId });
    return task.save();
  },

  async findById(taskId: string): Promise<ITask | null> {
    return Task.findById(taskId).lean();
  },

  async findByProject(projectId: string): Promise<ITask[]> {
    return Task.find({ projectId }).sort({ createdAt: -1 }).lean();
  },

  async updateById(taskId: string, data: UpdateTaskInput): Promise<ITask | null> {
    return Task.findByIdAndUpdate(taskId, data, { new: true, runValidators: true }).lean();
  },

  async deleteById(taskId: string): Promise<ITask | null> {
    return Task.findByIdAndDelete(taskId).lean();
  }
};
