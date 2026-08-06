import { z } from 'zod';
import { PROJECT_VISIBILITY, PROJECT_STATUS } from '../models/Project';

const urlRegex = /^https?:\/\/.+/;

const linksSchema = z.object({
  github: z.string().regex(urlRegex, 'Invalid GitHub URL').optional().or(z.literal('')),
  website: z.string().regex(urlRegex, 'Invalid Website URL').optional().or(z.literal('')),
  documentation: z.string().regex(urlRegex, 'Invalid Documentation URL').optional().or(z.literal('')),
}).optional();

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be under 100 characters'),
    description: z.string().min(1, 'Description is required').max(2000, 'Description must be under 2000 characters'),
    visibility: z.enum(PROJECT_VISIBILITY).optional(),
    techStack: z.array(z.string().max(50)).max(20, 'Maximum 20 tech stack items allowed').optional(),
    tags: z.array(z.string().max(30)).max(10, 'Maximum 10 tags allowed').optional(),
    links: linksSchema,
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    description: z.string().max(2000).optional(),
    visibility: z.enum(PROJECT_VISIBILITY).optional(),
    status: z.enum(PROJECT_STATUS).optional(),
    techStack: z.array(z.string().max(50)).max(20).optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
    links: linksSchema,
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
