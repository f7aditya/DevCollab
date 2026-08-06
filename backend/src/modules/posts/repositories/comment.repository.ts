import { Comment, IComment } from '../models/Comment';
import { CreateCommentInput } from '../dtos/post.schema';

export const CommentRepository = {
  async create(postId: string, authorId: string, data: CreateCommentInput): Promise<IComment> {
    const comment = new Comment({ ...data, postId, authorId });
    return comment.save();
  },

  async findByPost(postId: string, skip: number, limit: number): Promise<{ comments: IComment[], total: number }> {
    const [comments, total] = await Promise.all([
      Comment.find({ postId })
        .sort({ createdAt: 1 }) // Older comments first
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'firstName lastName avatarUrl')
        .lean(),
      Comment.countDocuments({ postId })
    ]);
    return { comments, total };
  },

  async deleteByPostId(postId: string): Promise<void> {
    await Comment.deleteMany({ postId });
  },

  async deleteById(commentId: string): Promise<IComment | null> {
    return Comment.findByIdAndDelete(commentId).lean();
  },
  
  async findById(commentId: string): Promise<IComment | null> {
    return Comment.findById(commentId).lean();
  }
};
