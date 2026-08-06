import { ProjectRole, IProjectRole, ProjectRoleType } from '../models/ProjectRole';
import mongoose from 'mongoose';

export const ProjectRoleRepository = {
  async create(projectId: string, userId: string, role: ProjectRoleType, session?: mongoose.ClientSession): Promise<IProjectRole> {
    const projectRole = new ProjectRole({ projectId, userId, role });
    return projectRole.save({ session });
  },

  async findRole(projectId: string, userId: string): Promise<IProjectRole | null> {
    return ProjectRole.findOne({ projectId, userId }).lean();
  },

  async removeRole(projectId: string, userId: string, session?: mongoose.ClientSession): Promise<void> {
    await ProjectRole.findOneAndDelete({ projectId, userId }, { session });
  },

  async updateRole(projectId: string, userId: string, newRole: ProjectRoleType, session?: mongoose.ClientSession): Promise<IProjectRole | null> {
    return ProjectRole.findOneAndUpdate(
      { projectId, userId },
      { role: newRole },
      { new: true, session, runValidators: true }
    ).lean();
  },

  async findMembers(projectId: string): Promise<IProjectRole[]> {
    return ProjectRole.find({ projectId }).populate('userId', 'firstName lastName avatarUrl email').lean();
  },

  async findRolesByUser(userId: string): Promise<IProjectRole[]> {
    return ProjectRole.find({ userId }).lean();
  }
};
