import { AppError } from '../../../core/errors/AppError';

export const GithubService = {
  /**
   * Extracts the owner and repo name from a GitHub URL
   * @param githubUrl The full GitHub URL (e.g. https://github.com/f7aditya/DevCollab)
   */
  parseRepoUrl(githubUrl: string): { owner: string; repo: string } | null {
    try {
      const url = new URL(githubUrl);
      if (url.hostname !== 'github.com') return null;
      
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return {
          owner: parts[0],
          repo: parts[1].replace('.git', ''),
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Invites a user to a GitHub repository
   */
  async inviteCollaborator(
    ownerToken: string,
    repoOwner: string,
    repoName: string,
    targetUsername: string
  ): Promise<boolean> {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/collaborators/${targetUsername}`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${ownerToken}`,
          Accept: 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('GitHub API error:', data);
        // If they are already a collaborator, it might return 204 or 422, but standard is 201 Created or 204 No Content
        if (response.status === 204) return true; // Already a collaborator
        return false;
      }

      return true; // Invite sent (201 Created)
    } catch (error) {
      console.error('Failed to invite collaborator via GitHub API', error);
      return false;
    }
  }
};
