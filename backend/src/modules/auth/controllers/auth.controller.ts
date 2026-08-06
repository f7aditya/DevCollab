import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../../../core/utils/catchAsync';

export const AuthController = {
  register: catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: result,
    });
  }),
};
