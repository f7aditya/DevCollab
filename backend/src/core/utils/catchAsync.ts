import { Request, Response, NextFunction } from 'express';

// Wraps async route handlers to catch errors and pass them to the global error handler
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
