import { Request, Response } from 'express';
import { catchAsync } from '../../../../core/utils/catchAsync';
import { GithubWebhookService } from '../services/githubWebhook.service';
import { GithubSyncService } from '../services/githubSync.service';
import { GithubIntegrationRepository } from '../repositories/githubIntegration.repository';

export const GithubWebhookController = {
  handleWebhook: catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers['x-hub-signature-256'] as string;
    const event = req.headers['x-github-event'] as string;
    const payloadId = req.headers['x-github-delivery'] as string;
    
    // We attached rawBody in app.ts express.json verify function
    const rawBody = (req as any).rawBody;

    if (!signature || !event || !rawBody) {
      return res.status(400).send('Missing headers or body');
    }

    const payload = req.body;
    
    // We need to find which integration this webhook belongs to.
    // We can lookup by repo full name in the payload.
    const repoFullName = payload.repository?.full_name;
    if (!repoFullName) {
      return res.status(400).send('No repository found in payload');
    }

    const [repoOwner, repoName] = repoFullName.split('/');
    const integrations = await GithubIntegrationRepository.findByRepoFullName(repoOwner, repoName);
    
    if (!integrations.length) {
      return res.status(404).send('Integration not found');
    }

    let validIntegration = null;

    // Verify signature against integrations
    for (const integration of integrations) {
      if (GithubWebhookService.verifySignature(rawBody, signature, integration.webhookSecret)) {
        validIntegration = integration;
        break;
      }
    }

    if (!validIntegration) {
      return res.status(401).send('Signature verification failed');
    }

    // Acknowledge receipt quickly
    res.status(200).send('Webhook received');

    // Process asynchronously (do not block the response)
    GithubSyncService.processWebhookEvent(validIntegration, event, payload)
      .then(() => GithubIntegrationRepository.updateSyncStatus(String(validIntegration._id), 'ACTIVE'))
      .catch((err) => {
        console.error('Failed to process webhook event:', err);
        GithubIntegrationRepository.updateSyncStatus(String(validIntegration._id), 'ERROR');
      });
  }),

  handleOAuthWebhook: catchAsync(async (req: Request, res: Response) => {
    // This is for GitHub OAuth App Authorization Revoked webhook
    const event = req.headers['x-github-event'] as string;
    
    // Check if it's the revocation event
    if (event === 'github_app_authorization') {
      const payload = req.body;
      if (payload.action === 'revoked' && payload.sender && payload.sender.id) {
        const githubId = String(payload.sender.id);
        const { GithubAuthService } = require('../services/githubAuth.service');
        await GithubAuthService.revokeByGithubId(githubId);
      }
    }

    res.status(200).send('Webhook received');
  })
};
