import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { catchAsync } from '../../../../core/utils/catchAsync';
import { GithubAuthService } from '../services/githubAuth.service';
import { AppError } from '../../../../core/errors/AppError';
import { verifyToken } from '../../../../core/utils/jwt';

export const GithubAuthController = {
  getAuthUrl: catchAsync(async (req: Request, res: Response) => {
    // Keep the old redirect URI so we don't break existing GitHub OAuth App configs
    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/github/callback`;
    const token = req.query.token as string | undefined;
    
    if (!token) {
      throw new AppError('Authentication required to connect GitHub', 401);
    }
    
    const url = GithubAuthService.getAuthUrl(redirectUri, token);
    res.redirect(url);
  }),

  callback: catchAsync(async (req: Request, res: Response) => {
    const { code, state } = req.query;
    if (!code || typeof code !== 'string') {
      throw new AppError('Authorization code missing', 400);
    }
    
    if (!state || typeof state !== 'string') {
      throw new AppError('State token missing', 400);
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/github/callback`;
    const accessToken = await GithubAuthService.exchangeCodeForToken(code, redirectUri);
    const githubProfile = await GithubAuthService.getGithubUserProfile(accessToken);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const decoded = verifyToken(state);
      if (decoded && decoded.id) {
        try {
          await GithubAuthService.connectAccount(decoded.id, githubProfile, accessToken);
          return res.redirect(`${frontendUrl}/settings`);
        } catch (dbErr: any) {
          console.error('Database error connecting account:', dbErr);
          if (dbErr.code === 11000) {
             return res.redirect(`${frontendUrl}/settings?error=github_already_linked`);
          }
          return res.redirect(`${frontendUrl}/settings?error=connection_failed`);
        }
      }
    } catch (err) {
      console.error('Invalid state token', err);
      return res.redirect(`${frontendUrl}/login?error=invalid_token`);
    }

    res.redirect(`${frontendUrl}/settings`);
  }),

  disconnect: catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    await GithubAuthService.disconnectAccount(userId);
    res.status(200).json({ success: true, message: 'GitHub account disconnected successfully' });
  }),
};
