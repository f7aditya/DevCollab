import { Request, Response } from 'express';
import { catchAsync } from '../../../../core/utils/catchAsync';
import { AppError } from '../../../../core/errors/AppError';
import { User } from '../../../auth/models/User';
import { decrypt } from '../../../../core/utils/crypto';
import { GithubIntegrationRepository } from '../repositories/githubIntegration.repository';
import { Project } from '../../../projects/models/Project';
import crypto from 'crypto';

export const GithubRepoController = {
  // Fetch repos for the connected user
  getAvailableRepos: catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select('+githubAccessToken');
    
    if (!user || !user.githubAccessToken) {
      throw new AppError('GitHub is not connected', 400);
    }

    const accessToken = decrypt(user.githubAccessToken);

    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      throw new AppError('Failed to fetch repositories from GitHub', response.status);
    }

    const repos = await response.json();
    res.status(200).json({
      success: true,
      data: repos.map((r: any) => ({
        id: String(r.id),
        name: r.name,
        fullName: r.full_name,
        private: r.private,
        url: r.html_url
      }))
    });
  }),

  // Link a repo to a project
  linkRepo: catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { projectId, repoFullName, githubRepoId } = req.body;
    
    if (!projectId || !repoFullName || !githubRepoId) {
      throw new AppError('Missing required fields', 400);
    }

    const user = await User.findById(userId).select('+githubAccessToken');
    if (!user || !user.githubAccessToken) {
      throw new AppError('GitHub is not connected', 400);
    }
    const accessToken = decrypt(user.githubAccessToken);

    const [repoOwner, repoName] = repoFullName.split('/');

    // Create a webhook for the repo
    const webhookSecret = crypto.randomBytes(20).toString('hex');
    const webhookUrl = `${req.protocol}://${req.get('host')}/api/v1/integrations/github/webhook`;

    let webhookId = '';
    try {
      const hookRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/hooks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          name: 'web',
          active: true,
          events: ['push', 'pull_request', 'issues', 'issue_comment'],
          config: {
            url: webhookUrl,
            content_type: 'json',
            secret: webhookSecret,
            insecure_ssl: '0'
          }
        })
      });
      
      if (!hookRes.ok) {
        const errorData = await hookRes.json();
        // If it already exists, it might return 422, we could handle that but keeping it strict
        throw new AppError(`GitHub API Error: ${errorData.message}`, 400);
      }
      const hookData = await hookRes.json();
      webhookId = String(hookData.id);
    } catch (err: any) {
      throw new AppError(`Failed to create webhook: ${err.message}`, 500);
    }

    const integration = await GithubIntegrationRepository.create({
      projectId,
      repoOwner,
      repoName,
      githubRepoId: String(githubRepoId),
      accessToken: user.githubAccessToken, // already encrypted
      webhookId,
      webhookSecret,
      addedBy: userId,
      syncStatus: 'ACTIVE'
    });

    res.status(201).json({
      success: true,
      data: integration
    });
  }),

  // Fetch recent activity
  getActivity: catchAsync(async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const integrations = await GithubIntegrationRepository.findByProjectId(projectId as string);
    if (!integrations.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    // For simplicity, fetch for the first linked repo
    const integration = integrations[0];
    const accessToken = decrypt(integration.accessToken);

    const response = await fetch(`https://api.github.com/repos/${integration.repoOwner}/${integration.repoName}/events?per_page=10`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      throw new AppError('Failed to fetch activity', 500);
    }

    const events = await response.json();
    res.status(200).json({
      success: true,
      data: events
    });
  }),

  // Fetch GitHub links for a specific task
  getTaskLinks: catchAsync(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    // Need to import TaskGithubLinkRepository, let's assume it's imported at the top
    const { TaskGithubLinkRepository } = require('../repositories/taskGithubLink.repository');
    
    const links = await TaskGithubLinkRepository.findByTaskId(taskId);
    res.status(200).json({
      success: true,
      data: links
    });
  })
};
