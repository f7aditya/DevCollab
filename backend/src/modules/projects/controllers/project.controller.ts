import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { catchAsync } from '../../../core/utils/catchAsync';
import { AppError } from '../../../core/errors/AppError';

export const ProjectController = {
  createProject: catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const project = await ProjectService.createProject(req.body, (req.user as any).id);
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  }),

  getMyProjects: catchAsync(async (req: Request, res: Response) => {
    const { projects, total } = await ProjectService.getMyProjects((req.user as any).id);
    
    res.status(200).json({
      success: true,
      message: 'My projects retrieved successfully',
      data: { projects, total }
    });
  }),

  getAllProjects: catchAsync(async (req: Request, res: Response) => {
    const { projects, total } = await ProjectService.getAllProjects(req.query);
    
    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
      data: { projects, total }
    });
  }),

  getProject: catchAsync(async (req: Request, res: Response) => {
    const project = await ProjectService.getProjectById(req.params.id as string);
    
    res.status(200).json({
      success: true,
      message: 'Project retrieved successfully',
      data: { project }
    });
  }),

  updateProject: catchAsync(async (req: Request, res: Response) => {
    const project = await ProjectService.updateProject(req.params.id as string, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project }
    });
  }),

  deleteProject: catchAsync(async (req: Request, res: Response) => {
    await ProjectService.deleteProject(req.params.id as string);
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: null
    });
  })
};
