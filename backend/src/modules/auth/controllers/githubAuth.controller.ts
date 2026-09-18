import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { catchAsync } from '../../../core/utils/catchAsync';
import { GithubAuthService } from '../services/githubAuth.service';
import { AppError } from '../../../core/errors/AppError';

export const GithubAuthController = {
  getAuthUrl: catchAsync(async (req: Request, res: Response) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/github/callback`;
    const token = req.query.token as string | undefined;
    const url = GithubAuthService.getAuthUrl(redirectUri, token);
    
    res.redirect(url);
  }),

  callback: catchAsync(async (req: Request, res: Response) => {
    const { code, state } = req.query;
    if (!code || typeof code !== 'string') {
      throw new AppError('Authorization code missing', 400);
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/github/callback`;
    
    const accessToken = await GithubAuthService.exchangeCodeForToken(code, redirectUri);
    const githubProfile = await GithubAuthService.getGithubUserProfile(accessToken);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (state && typeof state === 'string' && state.length > 10) {
      try {
        const { verifyToken } = require('../../../core/utils/jwt');
        const decoded = verifyToken(state);
        if (decoded && decoded.id) {
          await GithubAuthService.connectAccount(decoded.id, githubProfile, accessToken);
          return res.redirect(`${frontendUrl}/settings`);
        }
      } catch (err) {
        console.error('Invalid state token', err);
      }
    }

    const result = await GithubAuthService.loginOrRegister(githubProfile, accessToken);
    res.redirect(`${frontendUrl}/login?token=${result.token}`);
  }),
};
