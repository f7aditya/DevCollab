import { api } from '@/lib/api';

export interface GithubRepo {
  id: string;
  name: string;
  fullName: string;
  private: boolean;
  url: string;
}

export const getAvailableRepos = async (): Promise<GithubRepo[]> => {
  const response = await api.get('/integrations/github/repos');
  return response.data;
};

export const linkRepo = async (projectId: string, repoFullName: string, githubRepoId: string): Promise<any> => {
  const response = await api.post('/integrations/github/link-repo', {
    projectId,
    repoFullName,
    githubRepoId
  });
  return response.data;
};

export const getProjectGithubActivity = async (projectId: string): Promise<any[]> => {
  const response = await api.get(`/integrations/github/projects/${projectId}/activity`);
  return response.data;
};

export const getTaskLinks = async (taskId: string): Promise<any[]> => {
  if (!taskId) return [];
  const response = await api.get(`/integrations/github/tasks/${taskId}/links`);
  return response.data;
};
