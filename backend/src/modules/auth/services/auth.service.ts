import { User } from '../models/User';
import { AppError } from '../../../core/errors/AppError';
import { RegisterInput, LoginInput } from '../dtos/auth.schema';

import { generateToken } from '../../../core/utils/jwt';

export const AuthService = {
  async register(data: RegisterInput) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email is already in use', 400);
    }

    const newUser = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: data.password, // Hook in User.ts will hash this
      skills: data.skills || [],
    });

    const token = generateToken({ id: newUser.id });
    
    // Remove passwordHash from response output
    const userObject = newUser.toObject() as any;
    delete userObject.passwordHash;

    return { user: userObject, token };
  },

  async login(data: LoginInput) {
    // Select passwordHash explicitly because we set `select: false` in the schema
    const user = await User.findOne({ email: data.email }).select('+passwordHash');
    
    if (!user || !(await user.comparePassword(data.password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    const token = generateToken({ id: user.id });
    
    const userObject = user.toObject() as any;
    delete userObject.passwordHash;

    return { user: userObject, token };
  },
};
