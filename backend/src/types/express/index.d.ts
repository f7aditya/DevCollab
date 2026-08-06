import { Document } from 'mongoose';
import { IUser } from '../../modules/auth/models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
