import { Request, Response } from 'express';
import { catchAsync } from '../../../core/utils/catchAsync';
import { OAuthService } from '../services/oauth.service';
import { AppError } from '../../../core/errors/AppError';

export const OAuthController = {
  getGithubAuthUrl: catchAsync(async (req: Request, res: Response) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/github/callback`;
    const url = await OAuthService.getGithubAuthUrl(redirectUri);
    res.redirect(url);
  }),

  githubCallback: catchAsync(async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      throw new AppError('Authorization code missing', 400);
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/github/callback`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const accessToken = await OAuthService.exchangeGithubCode(code, redirectUri);
      const profile = await OAuthService.getGithubProfile(accessToken);
      const result = await OAuthService.loginOrRegister(profile);
      
      // Redirect to frontend with token
      const userStr = encodeURIComponent(JSON.stringify(result.user));
      res.redirect(`${frontendUrl}/login?token=${result.token}&user=${userStr}`);
    } catch (err: any) {
      console.error('GitHub OAuth error:', err);
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }),

};
