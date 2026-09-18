import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAvailableRepos, linkRepo, getProjectGithubActivity } from '../api/githubApi';

export const useAvailableRepos = () => {
  return useQuery({
    queryKey: ['github', 'available-repos'],
    queryFn: getAvailableRepos,
  });
};

export const useLinkRepo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, repoFullName, githubRepoId }: { projectId: string; repoFullName: string; githubRepoId: string }) =>
      linkRepo(projectId, repoFullName, githubRepoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['github', 'activity', variables.projectId] });
    },
  });
};

export const useProjectGithubActivity = (projectId: string) => {
  return useQuery({
    queryKey: ['github', 'activity', projectId],
    queryFn: () => getProjectGithubActivity(projectId),
    enabled: !!projectId,
    refetchInterval: 15000,
  });
};

export const useTaskLinks = (taskId: string | undefined) => {
  return useQuery({
    queryKey: ['github', 'taskLinks', taskId],
    // @ts-ignore
    queryFn: () => import('../api/githubApi').then(m => m.getTaskLinks(taskId!)),
    enabled: !!taskId,
  });
};
