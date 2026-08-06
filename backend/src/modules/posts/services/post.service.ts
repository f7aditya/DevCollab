import { PostRepository } from '../repositories/post.repository';
import { CommentRepository } from '../repositories/comment.repository';
import { CreatePostInput, UpdatePostInput, CreateCommentInput } from '../dtos/post.schema';
import { AppError } from '../../../core/errors/AppError';
import { IPost } from '../models/Post';
import { IComment } from '../models/Comment';
import { ProjectRoleRepository } from '../../projects/repositories/projectRole.repository';

export const PostService = {
  async getPosts(projectId: string, page: number, limit: number): Promise<{ posts: IPost[], total: number }> {
    const skip = (page - 1) * limit;
    return PostRepository.findByProject(projectId, skip, limit);
  },

  async getPostById(postId: string, projectId: string): Promise<IPost> {
    const post = await PostRepository.findById(postId);
    if (!post) throw new AppError('Post not found', 404);
    if (post.projectId.toString() !== projectId) throw new AppError('Post does not belong to this project', 400);
    return post;
  },

  async createPost(projectId: string, authorId: string, data: CreatePostInput): Promise<IPost> {
    return PostRepository.create(projectId, authorId, data);
  },

  async updatePost(postId: string, projectId: string, userId: string, data: UpdatePostInput): Promise<IPost> {
    const post = await this.getPostById(postId, projectId);

    // Only the author or an Admin/Owner can update a post
    if (post.authorId.toString() !== userId) {
      const userRole = await ProjectRoleRepository.findRole(projectId, userId);
      if (!userRole || !['ADMIN', 'OWNER'].includes(userRole.role)) {
        throw new AppError('You do not have permission to edit this post', 403);
      }
    }

    const updated = await PostRepository.updateById(postId, data);
    if (!updated) throw new AppError('Post could not be updated', 500);
    return updated;
  },

  async deletePost(postId: string, projectId: string, userId: string): Promise<void> {
    const post = await this.getPostById(postId, projectId);

    // Only the author or an Admin/Owner can delete a post
    if (post.authorId.toString() !== userId) {
      const userRole = await ProjectRoleRepository.findRole(projectId, userId);
      if (!userRole || !['ADMIN', 'OWNER'].includes(userRole.role)) {
        throw new AppError('You do not have permission to delete this post', 403);
      }
    }

    await CommentRepository.deleteByPostId(postId); // Cascade delete comments
    await PostRepository.deleteById(postId);
  },

  // COMMENTS
  async getComments(postId: string, projectId: string, page: number, limit: number): Promise<{ comments: IComment[], total: number }> {
    await this.getPostById(postId, projectId); // Verify post exists and is in project
    const skip = (page - 1) * limit;
    return CommentRepository.findByPost(postId, skip, limit);
  },

  async createComment(postId: string, projectId: string, authorId: string, data: CreateCommentInput): Promise<IComment> {
    await this.getPostById(postId, projectId);
    return CommentRepository.create(postId, authorId, data);
  },

  async deleteComment(commentId: string, postId: string, projectId: string, userId: string): Promise<void> {
    await this.getPostById(postId, projectId);
    const comment = await CommentRepository.findById(commentId);
    if (!comment) throw new AppError('Comment not found', 404);
    if (comment.postId.toString() !== postId) throw new AppError('Comment does not belong to this post', 400);

    if (comment.authorId.toString() !== userId) {
      const userRole = await ProjectRoleRepository.findRole(projectId, userId);
      if (!userRole || !['ADMIN', 'OWNER'].includes(userRole.role)) {
        throw new AppError('You do not have permission to delete this comment', 403);
      }
    }

    await CommentRepository.deleteById(commentId);
  }
};
