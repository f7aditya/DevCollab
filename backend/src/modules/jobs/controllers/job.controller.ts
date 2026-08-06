import { Request, Response } from 'express';
import { JobService } from '../services/job.service';
import { catchAsync } from '../../../core/utils/catchAsync';

export const JobController = {
  getJobs: catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const { jobs, total } = await JobService.getJobs(req.params.projectId as string, page, limit);
    res.status(200).json({ success: true, message: 'Jobs retrieved successfully', data: { jobs, total } });
  }),

  getAllJobs: catchAsync(async (req: Request, res: Response) => {
    const { jobs, total } = await JobService.getAllJobs(req.query);

    res.status(200).json({
      success: true,
      message: 'Global jobs retrieved successfully',
      data: { jobs, total }
    });
  }),

  getJob: catchAsync(async (req: Request, res: Response) => {
    const job = await JobService.getJobById(req.params.jobId as string, req.params.projectId as string);
    res.status(200).json({ success: true, message: 'Job retrieved successfully', data: { job } });
  }),

  createJob: catchAsync(async (req: Request, res: Response) => {
    const job = await JobService.createJob(req.params.projectId as string, (req.user as any).id, req.body);
    res.status(201).json({ success: true, message: 'Job created successfully', data: { job } });
  }),

  updateJob: catchAsync(async (req: Request, res: Response) => {
    const job = await JobService.updateJob(req.params.jobId as string, req.params.projectId as string, req.body);
    res.status(200).json({ success: true, message: 'Job updated successfully', data: { job } });
  }),

  deleteJob: catchAsync(async (req: Request, res: Response) => {
    await JobService.deleteJob(req.params.jobId as string, req.params.projectId as string);
    res.status(200).json({ success: true, message: 'Job deleted successfully', data: null });
  }),

  applyForJob: catchAsync(async (req: Request, res: Response) => {
    const applicantId = (req.user as any).id;
    const application = await JobService.applyForJob(
      req.params.projectId as string, 
      req.params.jobId as string, 
      applicantId, 
      req.body
    );
    res.status(201).json({ success: true, message: 'Application submitted successfully', data: { application } });
  }),

  getMyApplications: catchAsync(async (req: Request, res: Response) => {
    const applicantId = (req.user as any).id;
    const applications = await JobService.getMyApplications(applicantId);
    res.status(200).json({ success: true, message: 'My applications retrieved', data: { applications } });
  }),

  getApplications: catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    
    const { applications, total } = await JobService.getApplications(
      req.params.jobId as string, 
      req.params.projectId as string, 
      page, 
      limit
    );
    res.status(200).json({ success: true, message: 'Applications retrieved successfully', data: { applications, total } });
  }),

  updateApplicationStatus: catchAsync(async (req: Request, res: Response) => {
    const application = await JobService.updateApplicationStatus(
      req.params.applicationId as string,
      req.params.jobId as string,
      req.params.projectId as string,
      req.body
    );
    res.status(200).json({ success: true, message: 'Application status updated successfully', data: { application } });
  })
};
