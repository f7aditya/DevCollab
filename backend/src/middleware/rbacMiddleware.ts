import { Request, Response, NextFunction } from 'express';
import { ProjectRoleRepository } from '../modules/projects/repositories/projectRole.repository';
import { AppError } from '../core/errors/AppError';
import { ProjectRoleType } from '../modules/projects/models/ProjectRole';

export const restrictToProjectRoles = (...allowedRoles: ProjectRoleType[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.projectId || req.params.id; // Handles /projects/:id and /projects/:projectId/...
      
      if (!projectId) {
        return next(new AppError('Project ID is missing from the request parameters', 400));
      }

      if (!req.user) {
        return next(new AppError('User not authenticated', 401));
      }

      const roleEntry = await ProjectRoleRepository.findRole(projectId as string, (req.user as any).id);
      
      if (!roleEntry) {
        return next(new AppError('You are not a member of this project', 403));
      }

      // If no specific roles are required, just being a member is enough
      if (allowedRoles.length > 0 && !allowedRoles.includes(roleEntry.role)) {
        return next(new AppError(`You do not have permission. Required roles: ${allowedRoles.join(', ')}`, 403));
      }

      // Attach the user's role to the request for downstream controllers if needed
      (req as any).projectRole = roleEntry.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};
