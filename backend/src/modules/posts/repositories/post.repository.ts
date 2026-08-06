import { Post, IPost } from '../models/Post';
import { CreatePostInput, UpdatePostInput } from '../dtos/post.schema';

export const PostRepository = {
  async create(projectId: string, authorId: string, data: CreatePostInput): Promise<IPost> {
    const post = new Post({ ...data, projectId, authorId });
    return post.save();
  },

  async findByProject(projectId: string, skip: number, limit: number): Promise<{ posts: IPost[], total: number }> {
    const [posts, total] = await Promise.all([
      Post.find({ projectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'firstName lastName avatarUrl')
        .lean(),
      Post.countDocuments({ projectId })
    ]);
    return { posts, total };
  },

  async findById(postId: string): Promise<IPost | null> {
    return Post.findById(postId).populate('authorId', 'firstName lastName avatarUrl').lean();
  },

  async updateById(postId: string, data: UpdatePostInput): Promise<IPost | null> {
    return Post.findByIdAndUpdate(postId, data, { new: true, runValidators: true }).lean();
  },

  async deleteById(postId: string): Promise<IPost | null> {
    return Post.findByIdAndDelete(postId).lean();
  }
};
