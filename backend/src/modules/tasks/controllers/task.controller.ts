import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { catchAsync } from '../../../core/utils/catchAsync';

export const TaskController = {
  getTasks: catchAsync(async (req: Request, res: Response) => {
    const tasks = await TaskService.getTasksForProject(req.params.projectId as string);
    
    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: { tasks }
    });
  }),

  getTask: catchAsync(async (req: Request, res: Response) => {
    const task = await TaskService.getTaskById(req.params.taskId as string, req.params.projectId as string);
    
    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: { task }
    });
  }),

  createTask: catchAsync(async (req: Request, res: Response) => {
    const task = await TaskService.createTask(
      req.params.projectId as string, 
      (req.user as any).id, 
      req.body
    );
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  }),

  updateTask: catchAsync(async (req: Request, res: Response) => {
    const task = await TaskService.updateTask(
      req.params.taskId as string, 
      req.params.projectId as string, 
      req.body
    );
    
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  }),

  deleteTask: catchAsync(async (req: Request, res: Response) => {
    await TaskService.deleteTask(req.params.taskId as string, req.params.projectId as string);
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: null
    });
  }),

  reorderTasks: catchAsync(async (req: Request, res: Response) => {
    const { tasks } = req.body;
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ success: false, message: 'Invalid tasks array provided for reorder' });
    }

    await TaskService.reorderTasks(req.params.projectId as string, tasks);

    res.status(200).json({
      success: true,
      message: 'Tasks reordered successfully',
      data: null
    });
  })
};
