import { Request, Response } from 'express';
import { catchAsync } from '../../../core/utils/catchAsync';
import { OAuthService } from '../services/oauth.service';
import { AppError } from '../../../core/errors/AppError';

export const OAuthController = {
  getGoogleAuthUrl: catchAsync(async (req: Request, res: Response) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/google/callback`;
    const url = await OAuthService.getGoogleAuthUrl(redirectUri);
    res.redirect(url);
  }),

  googleCallback: catchAsync(async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      throw new AppError('Authorization code missing', 400);
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/google/callback`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const accessToken = await OAuthService.exchangeGoogleCode(code, redirectUri);
      const profile = await OAuthService.getGoogleProfile(accessToken);
      const result = await OAuthService.loginOrRegister(profile);
      
      // Redirect to frontend with token
      const userStr = encodeURIComponent(JSON.stringify(result.user));
      res.redirect(`${frontendUrl}/login?token=${result.token}&user=${userStr}`);
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }),

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

  getLinkedinAuthUrl: catchAsync(async (req: Request, res: Response) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/linkedin/callback`;
    const url = await OAuthService.getLinkedinAuthUrl(redirectUri);
    res.redirect(url);
  }),

  linkedinCallback: catchAsync(async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      throw new AppError('Authorization code missing', 400);
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/linkedin/callback`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const accessToken = await OAuthService.exchangeLinkedinCode(code, redirectUri);
      const profile = await OAuthService.getLinkedinProfile(accessToken);
      const result = await OAuthService.loginOrRegister(profile);
      
      // Redirect to frontend with token
      const userStr = encodeURIComponent(JSON.stringify(result.user));
      res.redirect(`${frontendUrl}/login?token=${result.token}&user=${userStr}`);
    } catch (err: any) {
      console.error('LinkedIn OAuth error:', err);
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  })
};
