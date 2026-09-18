import { TaskGithubLink, ITaskGithubLink } from '../models/TaskGithubLink';

export const TaskGithubLinkRepository = {
  async create(data: Partial<ITaskGithubLink>): Promise<ITaskGithubLink> {
    return TaskGithubLink.create(data);
  },

  async findByTaskId(taskId: string): Promise<ITaskGithubLink[]> {
    return TaskGithubLink.find({ taskId });
  },
  
  async findByGithubId(githubId: string): Promise<ITaskGithubLink[]> {
    return TaskGithubLink.find({ githubId });
  },

  async updateStatus(githubId: string, status: 'open' | 'closed' | 'merged' | 'draft'): Promise<void> {
    await TaskGithubLink.updateMany({ githubId }, { status });
  },

  async delete(taskId: string, githubId: string): Promise<void> {
    await TaskGithubLink.deleteOne({ taskId, githubId });
  }
};
