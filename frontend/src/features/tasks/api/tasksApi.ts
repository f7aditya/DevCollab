import { api } from "@/lib/api";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  reporterId: string;
  assigneeId?: string;
  tags: string[];
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const getTasks = async (projectId: string): Promise<Task[]> => {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data.tasks;
};

export const createTask = async (projectId: string, data: Partial<Task>): Promise<Task> => {
  const response = await api.post(`/projects/${projectId}/tasks`, data);
  return response.data.task;
};

export const updateTask = async (projectId: string, taskId: string, data: Partial<Task>): Promise<Task> => {
  const response = await api.patch(`/projects/${projectId}/tasks/${taskId}`, data);
  return response.data.task;
};

export const reorderTasks = async (projectId: string, tasks: { id: string; status: TaskStatus; order: number }[]): Promise<void> => {
  await api.patch(`/projects/${projectId}/tasks/batch/reorder`, { tasks });
};

export const deleteTask = async (projectId: string, taskId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/tasks/${taskId}`);
};
