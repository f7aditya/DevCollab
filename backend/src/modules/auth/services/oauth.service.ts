import { AppError } from '../../../core/errors/AppError';
import { generateToken } from '../../../core/utils/jwt';
import { User, IUser } from '../models/User';

export const OAuthService = {
  async getGithubAuthUrl(redirectUri: string) {
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    if (!GITHUB_CLIENT_ID) throw new AppError('GitHub OAuth is not configured on the server', 500);

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'read:user user:email',
      response_type: 'code',
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  },

  async exchangeGithubCode(code: string, redirectUri: string) {
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
    
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      throw new AppError('GitHub OAuth is not configured', 500);
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new AppError(`GitHub OAuth error: ${data.error_description}`, 400);
    }

    return data.access_token as string;
  },

  async getGithubProfile(accessToken: string) {
    const response = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
    });
    if (!response.ok) throw new AppError('Failed to fetch GitHub profile', response.status);
    const data = await response.json();

    let email = data.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
      });
      if (emailRes.ok) {
        const emails = await emailRes.json();
        const primary = emails.find((e: any) => e.primary);
        email = primary ? primary.email : emails[0]?.email;
      }
    }

    if (!email) throw new AppError('No email found for GitHub account', 400);

    return {
      providerId: String(data.id),
      email: email,
      firstName: data.name ? data.name.split(' ')[0] : data.login,
      lastName: data.name ? data.name.split(' ').slice(1).join(' ') : '',
      avatarUrl: data.avatar_url,
      provider: 'github' as const,
      githubUsername: data.login
    };
  },

  async loginOrRegister(profile: {
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    provider: 'github';
    githubUsername?: string;
  }) {
    let user = await User.findOne({ 
      $or: [
        { email: profile.email },
        { [`${profile.provider}Id`]: profile.providerId }
      ]
    });

    if (user) {
      const idField = `${profile.provider}Id` as keyof IUser;
      if (!user[idField]) {
        (user as any)[idField] = profile.providerId;
      }
      if (profile.provider === 'github' && profile.githubUsername) {
        user.githubUsername = profile.githubUsername;
      }
      if (!user.avatarUrl && profile.avatarUrl) {
         user.avatarUrl = profile.avatarUrl;
      }
      await user.save();
    } else {
      user = await User.create({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        [`${profile.provider}Id`]: profile.providerId,
        ...(profile.provider === 'github' ? { githubUsername: profile.githubUsername } : {}),
      });
    }

    const token = generateToken({ id: user._id });
    
    const userObject = user.toObject() as any;
    delete userObject.passwordHash;
    delete userObject.githubAccessToken;

    return { user: userObject, token };
  }
};
