import { z } from 'zod';

export const createChannelSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Channel name must be at least 2 characters')
      .max(50, 'Channel name must be under 50 characters')
      .regex(/^[a-zA-Z0-9-]+$/, 'Channel name can only contain letters, numbers, and hyphens')
      .transform(val => val.toLowerCase()), // Coerce to lowercase
    description: z.string().max(500, 'Description must be under 500 characters').optional(),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message is too long'),
  }),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>['body'];
export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
