import { Request, Response } from 'express';
import { PostService } from '../services/post.service';
import { catchAsync } from '../../../core/utils/catchAsync';

export const PostController = {
  getPosts: catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const { posts, total } = await PostService.getPosts(req.params.projectId as string, page, limit);
    
    res.status(200).json({ success: true, message: 'Posts retrieved successfully', data: { posts, total } });
  }),

  getPost: catchAsync(async (req: Request, res: Response) => {
    const post = await PostService.getPostById(req.params.postId as string, req.params.projectId as string);
    res.status(200).json({ success: true, message: 'Post retrieved successfully', data: { post } });
  }),

  createPost: catchAsync(async (req: Request, res: Response) => {
    const post = await PostService.createPost(req.params.projectId as string, (req.user as any).id, req.body);
    res.status(201).json({ success: true, message: 'Post created successfully', data: { post } });
  }),

  updatePost: catchAsync(async (req: Request, res: Response) => {
    const post = await PostService.updatePost(req.params.postId as string, req.params.projectId as string, (req.user as any).id, req.body);
    res.status(200).json({ success: true, message: 'Post updated successfully', data: { post } });
  }),

  deletePost: catchAsync(async (req: Request, res: Response) => {
    await PostService.deletePost(req.params.postId as string, req.params.projectId as string, (req.user as any).id);
    res.status(200).json({ success: true, message: 'Post deleted successfully', data: null });
  }),

  getComments: catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const { comments, total } = await PostService.getComments(req.params.postId as string, req.params.projectId as string, page, limit);
    res.status(200).json({ success: true, message: 'Comments retrieved successfully', data: { comments, total } });
  }),

  createComment: catchAsync(async (req: Request, res: Response) => {
    const comment = await PostService.createComment(req.params.postId as string, req.params.projectId as string, (req.user as any).id, req.body);
    res.status(201).json({ success: true, message: 'Comment added successfully', data: { comment } });
  }),

  deleteComment: catchAsync(async (req: Request, res: Response) => {
    await PostService.deleteComment(req.params.commentId as string, req.params.postId as string, req.params.projectId as string, (req.user as any).id);
    res.status(200).json({ success: true, message: 'Comment deleted successfully', data: null });
  })
};
