import React, { useState } from 'react';
import { useAvailableRepos, useLinkRepo } from '../hooks/useGithubActivity';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface RepoPickerModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const RepoPickerModal: React.FC<RepoPickerModalProps> = ({ projectId, onClose, onSuccess }) => {
  const { data: repos, isLoading, error } = useAvailableRepos();
  const linkMutation = useLinkRepo();
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  const handleLink = async () => {
    if (!selectedRepo || !repos) return;
    const repo = repos.find(r => r.id === selectedRepo);
    if (!repo) return;

    try {
      await linkMutation.mutateAsync({
        projectId,
        repoFullName: repo.fullName,
        githubRepoId: repo.id
      });
      onSuccess();
    } catch (err) {
      alert('Failed to link repo');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Link GitHub Repository</h2>
          <p className="text-sm text-muted-foreground mt-1">Select a repository to link to this project.</p>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-2">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="p-4 bg-danger/10 text-danger rounded-md text-sm">
              Failed to load repositories. Have you connected your GitHub account?
            </div>
          ) : repos?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No repositories found.
            </div>
          ) : (
            <div className="space-y-2">
              {repos?.map((repo) => (
                <div 
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo.id)}
                  className={`p-3 rounded-md border cursor-pointer transition-colors flex justify-between items-center ${
                    selectedRepo === repo.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-surface-hover'
                  }`}
                >
                  <div>
                    <div className="font-medium">{repo.name}</div>
                    <div className="text-xs text-muted-foreground">{repo.fullName}</div>
                  </div>
                  {repo.private && (
                    <span className="text-[10px] bg-secondary px-2 py-1 rounded-full text-muted-foreground font-medium">
                      Private
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border flex justify-end gap-3 bg-surface">
          <Button variant="outline" onClick={onClose} disabled={linkMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleLink} 
            disabled={!selectedRepo || linkMutation.isPending}
          >
            {linkMutation.isPending ? 'Linking...' : 'Link Repository'}
          </Button>
        </div>
      </div>
    </div>
  );
};
