import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../core/errors/AppError';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || (error as any).errors || [];
        const message = issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new AppError(`Validation failed: ${message}`, 400));
      }
      next(error);
    }
  };
};
