import mongoose from 'mongoose';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectRoleRepository } from '../repositories/projectRole.repository';
import { ChannelRepository } from '../../chat/repositories/channel.repository';
import { CreateProjectInput, UpdateProjectInput } from '../dtos/project.schema';
import { AppError } from '../../../core/errors/AppError';
import { IProject } from '../models/Project';

export const ProjectService = {
  async createProject(data: CreateProjectInput, userId: string): Promise<IProject> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create the Project
      const project = await ProjectRepository.create({ ...data, ownerId: userId }, session);

      // 2. Assign the creator as the 'OWNER' in ProjectRole
      await ProjectRoleRepository.create((project as any).id, userId, 'OWNER', session);

      // 3. Create a default 'general' channel
      await ChannelRepository.create((project as any).id, {
        name: 'general',
        description: 'General discussion for ' + project.name
      }, session);

      await session.commitTransaction();
      session.endSession();

      return project;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  async getMyProjects(userId: string): Promise<{ projects: any[], total: number }> {
    const roles = await ProjectRoleRepository.findRolesByUser(userId);
    const projectIds = roles.map(role => role.projectId);
    
    // Find all projects where the user is a member
    const filter = { _id: { $in: projectIds } };
    
    const projects = await mongoose.model('Project').find(filter).sort({ createdAt: -1 }).lean() as any[];
    
    // Attach role info to projects
    const projectsWithRoles = projects.map(project => {
      const role = roles.find(r => r.projectId.toString() === project._id.toString());
      return {
        ...project,
        myRole: role?.role || 'MEMBER',
        joinedAt: role?.createdAt || project.createdAt,
      };
    });
    
    return { projects: projectsWithRoles, total: projectsWithRoles.length };
  },

  async getAllProjects(query: any): Promise<{ projects: IProject[], total: number }> {
    const page = parseInt(query.page as string, 10) || 1;
    const limit = parseInt(query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { visibility: 'PUBLIC' }; // Only show public projects by default in global search

    if (query.status) filter.status = query.status;
    if (query.techStack) filter.techStack = { $in: (query.techStack as string).split(',') };
    if (query.tags) filter.tags = { $in: (query.tags as string).split(',') };
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    return ProjectRepository.findAll(filter, skip, limit);
  },

  async getProjectById(projectId: string): Promise<IProject> {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    return project;
  },

  async updateProject(projectId: string, data: UpdateProjectInput): Promise<IProject> {
    const project = await ProjectRepository.updateById(projectId, data);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    return project;
  },

  async deleteProject(projectId: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const project = await ProjectRepository.deleteById(projectId, session);
      if (!project) {
        throw new AppError('Project not found', 404);
      }
      // Note: We would also cascade delete tasks, roles, etc. here in a production app.
      // For MVP, we at least need to remove the roles associated with this project.
      await mongoose.model('ProjectRole').deleteMany({ projectId }, { session });

      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
};
