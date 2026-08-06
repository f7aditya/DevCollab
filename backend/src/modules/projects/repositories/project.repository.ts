import { Project, IProject } from '../models/Project';
import { CreateProjectInput, UpdateProjectInput } from '../dtos/project.schema';
import mongoose from 'mongoose';

export const ProjectRepository = {
  async create(data: CreateProjectInput & { ownerId: string }, session?: mongoose.ClientSession): Promise<IProject> {
    const project = new Project(data);
    return project.save({ session });
  },

  async findById(id: string): Promise<IProject | null> {
    return Project.findById(id).lean();
  },

  async updateById(id: string, data: UpdateProjectInput, session?: mongoose.ClientSession): Promise<IProject | null> {
    return Project.findByIdAndUpdate(id, data, { new: true, session, runValidators: true }).lean();
  },

  async deleteById(id: string, session?: mongoose.ClientSession): Promise<IProject | null> {
    return Project.findByIdAndDelete(id, { session }).lean();
  },
  
  // Basic search placeholder for Phase 4
  async findAll(query: any, skip: number, limit: number): Promise<{ projects: IProject[], total: number }> {
    const [projects, total] = await Promise.all([
      Project.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Project.countDocuments(query)
    ]);
    return { projects, total };
  }
};
