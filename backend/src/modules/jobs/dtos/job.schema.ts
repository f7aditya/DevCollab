import { z } from 'zod';
import { JOB_STATUS } from '../models/Job';
import { APPLICATION_STATUS } from '../models/Application';

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(150),
    description: z.string().min(10).max(5000),
    requirements: z.array(z.string().max(200)).max(20).optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
    status: z.enum(JOB_STATUS).optional(),
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(150).optional(),
    description: z.string().min(10).max(5000).optional(),
    requirements: z.array(z.string().max(200)).max(20).optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
    status: z.enum(JOB_STATUS).optional(),
  }),
});

export const applyForJobSchema = z.object({
  body: z.object({
    coverLetter: z.string().min(10).max(3000),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'REJECTED']),
  }),
});

export type CreateJobInput = z.infer<typeof createJobSchema>['body'];
export type UpdateJobInput = z.infer<typeof updateJobSchema>['body'];
export type ApplyForJobInput = z.infer<typeof applyForJobSchema>['body'];
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>['body'];
