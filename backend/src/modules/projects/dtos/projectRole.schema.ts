import { z } from 'zod';
import { PROJECT_ROLES } from '../models/ProjectRole';

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(PROJECT_ROLES),
  }),
});

export const inviteMemberSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    role: z.enum(PROJECT_ROLES).default('MEMBER'),
  }),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>['body'];
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>['body'];
