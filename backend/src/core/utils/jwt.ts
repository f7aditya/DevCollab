import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, (process.env.JWT_SECRET as string) || 'super-secret-dev-key', {
    expiresIn: (process.env.JWT_EXPIRES_IN as string) || '7d',
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, (process.env.JWT_SECRET as string) || 'super-secret-dev-key');
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
};
