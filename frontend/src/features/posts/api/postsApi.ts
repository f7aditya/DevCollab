import { api } from "@/lib/api";

export interface Post {
  _id: string;
  projectId: string;
  authorId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostComment {
  _id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ---- POSTS ----
export const getPosts = async (projectId: string): Promise<Post[]> => {
  const response = await api.get(`/projects/${projectId}/posts`);
  return response.data.posts;
};

export const createPost = async (projectId: string, data: { title: string; content: string; tags: string[] }): Promise<Post> => {
  const response = await api.post(`/projects/${projectId}/posts`, data);
  return response.data.post;
};

export const deletePost = async (projectId: string, postId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/posts/${postId}`);
};

// ---- COMMENTS ----
export const getComments = async (projectId: string, postId: string): Promise<PostComment[]> => {
  const response = await api.get(`/projects/${projectId}/posts/${postId}/comments`);
  return response.data.comments;
};

export const createComment = async (projectId: string, postId: string, content: string): Promise<PostComment> => {
  const response = await api.post(`/projects/${projectId}/posts/${postId}/comments`, { content });
  return response.data.comment;
};

export const deleteComment = async (projectId: string, postId: string, commentId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/posts/${postId}/comments/${commentId}`);
};
