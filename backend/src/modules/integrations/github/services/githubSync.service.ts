import { TaskGithubLinkRepository } from '../repositories/taskGithubLink.repository';
// Using relative path to task model - assuming it's in modules/tasks/models/Task
import { Task } from '../../../tasks/models/Task';
import { AppError } from '../../../../core/errors/AppError';
import { IGithubIntegration } from '../models/GithubIntegration';

export const GithubSyncService = {
  /**
   * Processes a GitHub webhook payload and updates linked tasks
   */
  async processWebhookEvent(integration: IGithubIntegration, event: string, payload: any) {
    if (event === 'pull_request') {
      await this.handlePullRequest(integration, payload);
    } else if (event === 'issues') {
      await this.handleIssue(integration, payload);
    } else if (event === 'push') {
      await this.handlePush(integration, payload);
    }
    // other events can be ignored or handled similarly
  },

  async handlePullRequest(integration: IGithubIntegration, payload: any) {
    const pr = payload.pull_request;
    const githubId = String(pr.id);
    let status: 'open' | 'closed' | 'merged' | 'draft' = pr.state;
    
    if (pr.merged) {
      status = 'merged';
    } else if (pr.draft) {
      status = 'draft';
    }

    // 1. Update the link status
    await TaskGithubLinkRepository.updateStatus(githubId, status);

    // 2. If merged, find linked tasks and update their DevCollab status
    if (status === 'merged') {
      const links = await TaskGithubLinkRepository.findByGithubId(githubId);
      for (const link of links) {
        // Move task to DONE
        await Task.findByIdAndUpdate(link.taskId, { status: 'DONE' });
      }
    }
  },

  async handleIssue(integration: IGithubIntegration, payload: any) {
    const issue = payload.issue;
    const githubId = String(issue.id);
    const status: 'open' | 'closed' = issue.state;

    // Update the link status
    await TaskGithubLinkRepository.updateStatus(githubId, status);
  },

  async handlePush(integration: IGithubIntegration, payload: any) {
    // We could extract commit messages and look for "Fixes DEV-123" to auto-link
    // For this strict implementation, we'll log it as a stub for future parsing
    const commits = payload.commits || [];
    for (const commit of commits) {
      const message = commit.message as string;
      // Extract task ID from commit message (e.g. #task_id) if we have a regex
    }
  }
};
