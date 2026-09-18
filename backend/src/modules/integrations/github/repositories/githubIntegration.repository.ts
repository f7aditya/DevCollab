import { GithubIntegration, IGithubIntegration } from '../models/GithubIntegration';

export const GithubIntegrationRepository = {
  async create(data: Partial<IGithubIntegration>): Promise<IGithubIntegration> {
    return GithubIntegration.create(data);
  },

  async findByProjectId(projectId: string): Promise<IGithubIntegration[]> {
    return GithubIntegration.find({ projectId });
  },

  async findByRepoFullName(repoOwner: string, repoName: string): Promise<IGithubIntegration[]> {
    return GithubIntegration.find({ repoOwner, repoName });
  },

  async updateSyncStatus(id: string, status: 'PENDING' | 'ACTIVE' | 'ERROR'): Promise<void> {
    await GithubIntegration.findByIdAndUpdate(id, { syncStatus: status, lastSyncedAt: new Date() });
  },
  
  async deleteByProjectIdAndRepo(projectId: string, githubRepoId: string): Promise<void> {
    await GithubIntegration.deleteOne({ projectId, githubRepoId });
  }
};
