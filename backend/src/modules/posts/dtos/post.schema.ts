import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(200),
    content: z.string().min(1, 'Content cannot be empty').max(10000),
    tags: z.array(z.string().max(30)).max(10).optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(200).optional(),
    content: z.string().min(1).max(10000).optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
  }),
});

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(2000),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>['body'];
export type UpdatePostInput = z.infer<typeof updatePostSchema>['body'];
export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
