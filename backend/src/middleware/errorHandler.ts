import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/errors/AppError';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err as AppError;

  if (!error.isOperational) {
    // Convert generic errors into AppErrors for consistent formatting
    error = new AppError(err.message || 'Internal Server Error', 500);
    error.isOperational = false;
  }

  // Log unexpected errors (using simple console.error for MVP)
  if (error.statusCode === 500) {
    console.error(`[UNEXPECTED ERROR] ${err.name}: ${err.message}`);
    console.error(err.stack);
  }

  res.status(error.statusCode).json({
    success: false,
    error: {
      status: error.status,
      message: error.message,
      // Include stack trace only in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
