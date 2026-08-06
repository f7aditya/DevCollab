import { Application, IApplication, ApplicationStatus } from '../models/Application';
import { ApplyForJobInput } from '../dtos/job.schema';

export const ApplicationRepository = {
  async create(projectId: string, jobId: string, applicantId: string, data: ApplyForJobInput): Promise<IApplication> {
    const app = new Application({ ...data, projectId, jobId, applicantId });
    return app.save();
  },

  async findByJob(jobId: string, skip: number, limit: number): Promise<{ applications: IApplication[], total: number }> {
    const [applications, total] = await Promise.all([
      Application.find({ jobId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('applicantId', 'firstName lastName avatarUrl')
        .lean(),
      Application.countDocuments({ jobId })
    ]);
    return { applications, total };
  },

  async findByApplicant(applicantId: string): Promise<IApplication[]> {
    return Application.find({ applicantId })
      .sort({ createdAt: -1 })
      .populate('jobId', 'title status description requirements')
      .populate('projectId', 'name')
      .lean();
  },

  async findById(applicationId: string): Promise<IApplication | null> {
    return Application.findById(applicationId).lean();
  },

  async updateStatus(applicationId: string, status: ApplicationStatus): Promise<IApplication | null> {
    return Application.findByIdAndUpdate(applicationId, { status }, { new: true, runValidators: true }).lean();
  },

  async deleteByJobId(jobId: string): Promise<void> {
    await Application.deleteMany({ jobId });
  }
};
