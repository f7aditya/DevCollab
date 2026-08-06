import { Request, Response } from 'express';
import { ProjectRoleService } from '../services/projectRole.service';
import { catchAsync } from '../../../core/utils/catchAsync';

export const ProjectRoleController = {
  getMembers: catchAsync(async (req: Request, res: Response) => {
    const members = await ProjectRoleService.getMembers(req.params.projectId as string);
    
    res.status(200).json({
      success: true,
      message: 'Members retrieved successfully',
      data: { members }
    });
  }),

  inviteMember: catchAsync(async (req: Request, res: Response) => {
    const member = await ProjectRoleService.inviteMember(req.params.projectId as string, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Member invited successfully',
      data: { member }
    });
  }),

  updateMemberRole: catchAsync(async (req: Request, res: Response) => {
    const member = await ProjectRoleService.updateMemberRole(
      req.params.projectId as string, 
      req.params.userId as string, 
      req.body, 
      (req.user as any).id
    );
    
    res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      data: { member }
    });
  }),

  removeMember: catchAsync(async (req: Request, res: Response) => {
    await ProjectRoleService.removeMember(req.params.projectId as string, req.params.userId as string);
    
    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: null
    });
  }),

  leaveProject: catchAsync(async (req: Request, res: Response) => {
    await ProjectRoleService.leaveProject(req.params.projectId as string, (req.user as any).id);
    
    res.status(200).json({
      success: true,
      message: 'Left project successfully',
      data: null
    });
  }),

  transferOwnership: catchAsync(async (req: Request, res: Response) => {
    const { newOwnerId } = req.body;
    if (!newOwnerId) {
      return res.status(400).json({ success: false, message: 'newOwnerId is required' });
    }

    await ProjectRoleService.transferOwnership(req.params.projectId as string, (req.user as any).id, newOwnerId);
    
    res.status(200).json({
      success: true,
      message: 'Ownership transferred successfully',
      data: null
    });
  })
};
