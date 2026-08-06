import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../core/utils/jwt';
import { User } from '../modules/auth/models/User';
import { AppError } from '../core/errors/AppError';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }
    
    // 1. Verify token
    const decoded = verifyToken(token);
    
    // 2. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }
    
    // 3. Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};
