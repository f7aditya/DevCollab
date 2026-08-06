import { TaskRepository } from '../repositories/task.repository';
import { ProjectRoleRepository } from '../../projects/repositories/projectRole.repository';
import { CreateTaskInput, UpdateTaskInput } from '../dtos/task.schema';
import { AppError } from '../../../core/errors/AppError';
import { ITask } from '../models/Task';

export const TaskService = {
  async getTasksForProject(projectId: string): Promise<ITask[]> {
    return TaskRepository.findByProject(projectId);
  },

  async getTaskById(taskId: string, projectId: string): Promise<ITask> {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    // Security check: ensure task belongs to the project in the URL
    if (task.projectId.toString() !== projectId) {
      throw new AppError('Task does not belong to this project', 400);
    }
    return task;
  },

  async createTask(projectId: string, reporterId: string, data: CreateTaskInput): Promise<ITask> {
    // If an assignee is provided, ensure they are a member of the project
    if (data.assigneeId) {
      const isMember = await ProjectRoleRepository.findRole(projectId, data.assigneeId);
      if (!isMember) {
        throw new AppError('Assignee is not a member of this project', 400);
      }
    }

    return TaskRepository.create(projectId, reporterId, data);
  },

  async updateTask(taskId: string, projectId: string, data: UpdateTaskInput): Promise<ITask> {
    // Verify task exists and belongs to project
    await this.getTaskById(taskId, projectId);

    if (data.assigneeId) {
      const isMember = await ProjectRoleRepository.findRole(projectId, data.assigneeId);
      if (!isMember) {
        throw new AppError('Assignee is not a member of this project', 400);
      }
    }

    const updatedTask = await TaskRepository.updateById(taskId, data);
    if (!updatedTask) {
      throw new AppError('Task could not be updated', 500);
    }
    return updatedTask;
  },

  async deleteTask(taskId: string, projectId: string): Promise<void> {
    await this.getTaskById(taskId, projectId);
    await TaskRepository.deleteById(taskId);
  },

  async reorderTasks(projectId: string, tasks: { id: string; status: string; order: number }[]): Promise<void> {
    await Promise.all(tasks.map(task => 
      TaskRepository.updateById(task.id, { status: task.status as any, order: task.order } as any)
    ));
  }
};
