import { Router } from 'express';
import { GithubAuthController } from './controllers/githubAuth.controller';
import { GithubRepoController } from './controllers/githubRepo.controller';
import { GithubWebhookController } from './controllers/githubWebhook.controller';
import { protect } from '../../../middleware/authMiddleware'; 

import rateLimit from 'express-rate-limit';

const router = Router();

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // 500 webhooks per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Webhook route - public, uses its own signature verification
router.post('/webhook', webhookLimiter, GithubWebhookController.handleWebhook);
router.post('/oauth-webhook', webhookLimiter, GithubWebhookController.handleOAuthWebhook);

// TEMPORARY FIX ENDPOINT: Force clear all ghost github accounts
router.get('/force-clear', async (req, res) => {
  const { User } = require('../../auth/models/User');
  const result = await User.updateMany(
    { githubId: { $exists: true, $ne: null } },
    { $unset: { githubId: '', githubUsername: '', githubAccessToken: '' } }
  );
  res.send(`Successfully cleared GitHub data from ${result.modifiedCount} users. You can now connect your GitHub account normally in settings!`);
});

// Protected API Routes
router.get('/connect', GithubAuthController.getAuthUrl);
router.get('/callback', GithubAuthController.callback);

// Protected API Routes
router.use(protect);
router.delete('/disconnect', GithubAuthController.disconnect);
router.get('/repos', GithubRepoController.getAvailableRepos);
router.post('/link-repo', GithubRepoController.linkRepo);
router.get('/projects/:id/activity', GithubRepoController.getActivity);
router.get('/tasks/:taskId/links', GithubRepoController.getTaskLinks);

export { router as githubRouter };
