import { AppError } from '../../../../core/errors/AppError';
import { encrypt, decrypt } from '../../../../core/utils/crypto';
import { User } from '../../../auth/models/User';

export const GithubAuthService = {
  getAuthUrl(redirectUri: string, state?: string) {
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    if (!GITHUB_CLIENT_ID) {
      throw new AppError('GitHub OAuth is not configured on the server', 500);
    }
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'read:user user:email repo admin:repo_hook', // added admin:repo_hook for webhooks
      response_type: 'code',
    });
    if (state) {
      params.append('state', state);
    }
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  },

  async exchangeCodeForToken(code: string, redirectUri: string) {
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
    
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      throw new AppError('GitHub OAuth is not configured on the server', 500);
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

  async getGithubUserProfile(accessToken: string) {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new AppError('Failed to fetch user profile from GitHub', response.status);
    }

    const data = await response.json();
    return {
      id: String(data.id),
      username: data.login,
      avatarUrl: data.avatar_url,
    };
  },

  async connectAccount(userId: string, githubProfile: { id: string; username: string }, accessToken: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    user.githubId = githubProfile.id;
    user.githubUsername = githubProfile.username;
    // Store encrypted
    user.githubAccessToken = encrypt(accessToken);
    await user.save();

    return user;
  },

  async disconnectAccount(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    // Unset the GitHub fields
    user.githubId = undefined;
    user.githubUsername = undefined;
    user.githubAccessToken = undefined;
    await user.save();

    // Optionally, we could also delete all GithubIntegrations tied to this user, 
    // but typically those are tied to the Project. We'll leave them or clean them up later.
    return user;
  },

  async revokeByGithubId(githubId: string) {
    const user = await User.findOne({ githubId });
    if (user) {
      user.githubId = undefined;
      user.githubUsername = undefined;
      user.githubAccessToken = undefined;
      await user.save();
    }
  }
};
