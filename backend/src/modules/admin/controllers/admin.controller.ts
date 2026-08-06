import { Request, Response } from 'express';
import { catchAsync } from '../../../core/utils/catchAsync';
import { AdminService } from '../services/admin.service';

export const AdminController = {
  getAnalytics: catchAsync(async (req: Request, res: Response) => {
    const metrics = await AdminService.getGlobalMetrics();
    
    res.status(200).json({
      success: true,
      data: { metrics }
    });
  })
};
