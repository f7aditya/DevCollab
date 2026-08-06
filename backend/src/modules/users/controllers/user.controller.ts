import { Request, Response } from 'express';
import { catchAsync } from '../../../core/utils/catchAsync';
import { UserService } from '../services/user.service';

export const UserController = {
  getMe: catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.getProfile((req.user as any).id);
    
    res.status(200).json({
      success: true,
      data: { user }
    });
  }),

  updateMe: catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.updateProfile((req.user as any).id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  })
};
