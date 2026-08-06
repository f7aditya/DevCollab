import { JobRepository } from '../repositories/job.repository';
import { ApplicationRepository } from '../repositories/application.repository';
import { CreateJobInput, UpdateJobInput, ApplyForJobInput, UpdateApplicationStatusInput } from '../dtos/job.schema';
import { AppError } from '../../../core/errors/AppError';
import { IJob } from '../models/Job';
import { IApplication } from '../models/Application';
import { ProjectRoleRepository } from '../../projects/repositories/projectRole.repository';

export const JobService = {
  // JOBS
  async getJobs(projectId: string, page: number, limit: number): Promise<{ jobs: IJob[], total: number }> {
    const skip = (page - 1) * limit;
    return JobRepository.findByProject(projectId, skip, limit);
  },

  async getAllJobs(query: any): Promise<{ jobs: IJob[], total: number }> {
    const page = parseInt(query.page as string, 10) || 1;
    const limit = parseInt(query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filters: any = {};
    if (query.search) {
      filters.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }
    
    return JobRepository.findAllJobs(skip, limit, filters);
  },

  async getJobById(jobId: string, projectId: string): Promise<IJob> {
    const job = await JobRepository.findById(jobId);
    if (!job) throw new AppError('Job not found', 404);
    if (job.projectId.toString() !== projectId) throw new AppError('Job does not belong to this project', 400);
    return job;
  },

  async createJob(projectId: string, authorId: string, data: CreateJobInput): Promise<IJob> {
    return JobRepository.create(projectId, authorId, data);
  },

  async updateJob(jobId: string, projectId: string, data: UpdateJobInput): Promise<IJob> {
    await this.getJobById(jobId, projectId); // Verify exists and belongs to project
    const updated = await JobRepository.updateById(jobId, data);
    if (!updated) throw new AppError('Job could not be updated', 500);
    return updated;
  },

  async deleteJob(jobId: string, projectId: string): Promise<void> {
    await this.getJobById(jobId, projectId);
    await ApplicationRepository.deleteByJobId(jobId); // Cascade delete
    await JobRepository.deleteById(jobId);
  },

  // APPLICATIONS
  async getMyApplications(userId: string): Promise<IApplication[]> {
    return ApplicationRepository.findByApplicant(userId);
  },

  async applyForJob(projectId: string, jobId: string, applicantId: string, data: ApplyForJobInput): Promise<IApplication> {
    const job = await this.getJobById(jobId, projectId);
    if (job.status !== 'OPEN') {
      throw new AppError('This job is no longer accepting applications', 400);
    }
    
    // Ensure applicant is not already in the project
    const existingRole = await ProjectRoleRepository.findRole(projectId, applicantId);
    if (existingRole) {
      throw new AppError('You are already a member of this project', 400);
    }

    try {
      return await ApplicationRepository.create(projectId, jobId, applicantId, data);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('You have already applied for this job', 400);
      }
      throw error;
    }
  },

  async getApplications(jobId: string, projectId: string, page: number, limit: number): Promise<{ applications: IApplication[], total: number }> {
    await this.getJobById(jobId, projectId);
    const skip = (page - 1) * limit;
    return ApplicationRepository.findByJob(jobId, skip, limit);
  },

  async updateApplicationStatus(applicationId: string, jobId: string, projectId: string, data: UpdateApplicationStatusInput): Promise<IApplication> {
    await this.getJobById(jobId, projectId);
    
    const app = await ApplicationRepository.findById(applicationId);
    if (!app) throw new AppError('Application not found', 404);
    if (app.jobId.toString() !== jobId) throw new AppError('Application does not match this job', 400);

    const updated = await ApplicationRepository.updateStatus(applicationId, data.status);
    if (!updated) throw new AppError('Application could not be updated', 500);

    // If accepted, add them to the project as a MEMBER
    if (data.status === 'ACCEPTED') {
       const existingRole = await ProjectRoleRepository.findRole(projectId, app.applicantId.toString());
       if (!existingRole) {
          await ProjectRoleRepository.create(projectId, app.applicantId.toString(), 'MEMBER');
       }
    }

    return updated;
  }
};
