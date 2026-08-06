import { User, IUser } from '../../auth/models/User';
import { AppError } from '../../../core/errors/AppError';

export class UserService {
  static async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  static async updateProfile(userId: string, data: Partial<IUser>): Promise<IUser> {
    // Prevent updating sensitive fields directly through this route
    delete data.passwordHash;
    delete data.email;
    delete data.status;

    const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }
}
