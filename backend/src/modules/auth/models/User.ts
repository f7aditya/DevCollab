import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  bio?: string;
  skills: string[];
  status: 'ACTIVE' | 'SUSPENDED';
  githubId?: string;
  githubUsername?: string;
  githubAccessToken?: string;


  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    avatarUrl: { type: String },
    bio: { type: String, maxlength: 500 },
    skills: [{ type: String }],
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    githubId: { type: String, unique: true, sparse: true },
    githubUsername: { type: String },
    githubAccessToken: { type: String, select: false },


  },
  { timestamps: true }
);

// Hash password before saving if it has been modified
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash') || !this.passwordHash) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
