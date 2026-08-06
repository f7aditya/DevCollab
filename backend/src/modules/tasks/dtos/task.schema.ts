import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY } from '../models/Task';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(150),
    description: z.string().max(3000).optional(),
    status: z.enum(TASK_STATUS).optional(),
    priority: z.enum(TASK_PRIORITY).optional(),
    assigneeId: z.string().optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
    dueDate: z.string().datetime().optional(), // Expects ISO-8601 string
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(150).optional(),
    description: z.string().max(3000).optional(),
    status: z.enum(TASK_STATUS).optional(),
    priority: z.enum(TASK_PRIORITY).optional(),
    assigneeId: z.string().optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
