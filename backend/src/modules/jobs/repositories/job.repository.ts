import { Job, IJob } from '../models/Job';
import { CreateJobInput, UpdateJobInput } from '../dtos/job.schema';

export const JobRepository = {
  async create(projectId: string, authorId: string, data: CreateJobInput): Promise<IJob> {
    const job = new Job({ ...data, projectId, authorId });
    return job.save();
  },

  async findByProject(projectId: string, skip: number, limit: number): Promise<{ jobs: IJob[], total: number }> {
    const [jobs, total] = await Promise.all([
      Job.find({ projectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'firstName lastName avatarUrl')
        .lean(),
      Job.countDocuments({ projectId })
    ]);
    return { jobs, total };
  },

  async findAllJobs(skip: number, limit: number, filters: any = {}): Promise<{ jobs: IJob[], total: number }> {
    const [jobs, total] = await Promise.all([
      Job.find({ status: 'OPEN', ...filters })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'firstName lastName avatarUrl')
        .populate('projectId', 'name')
        .lean(),
      Job.countDocuments({ status: 'OPEN', ...filters })
    ]);
    return { jobs, total };
  },

  async findById(jobId: string): Promise<IJob | null> {
    return Job.findById(jobId).populate('authorId', 'firstName lastName avatarUrl').lean();
  },

  async updateById(jobId: string, data: UpdateJobInput): Promise<IJob | null> {
    return Job.findByIdAndUpdate(jobId, data, { new: true, runValidators: true }).lean();
  },

  async deleteById(jobId: string): Promise<IJob | null> {
    return Job.findByIdAndDelete(jobId).lean();
  }
};
