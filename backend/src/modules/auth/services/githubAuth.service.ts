import { User } from '../models/User';
import { AppError } from '../../../core/errors/AppError';
import { generateToken } from '../../../core/utils/jwt';

export const GithubAuthService = {
  getAuthUrl(redirectUri: string, state?: string) {
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    if (!GITHUB_CLIENT_ID) {
      throw new AppError('GitHub OAuth is not configured on the server', 500);
    }
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'read:user user:email repo',
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

    let email = data.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary) || emails[0];
      email = primaryEmail?.email;
    }

    return {
      id: String(data.id),
      username: data.login,
      name: data.name || data.login,
      email: email,
      avatarUrl: data.avatar_url,
    };
  },

  async loginOrRegister(githubProfile: any, accessToken: string) {
    let user = await User.findOne({ 
      $or: [
        { githubId: githubProfile.id },
        { email: githubProfile.email }
      ]
    });

    if (user) {
      user.githubId = githubProfile.id;
      user.githubUsername = githubProfile.username;
      user.githubAccessToken = accessToken;
      if (!user.avatarUrl && githubProfile.avatarUrl) {
         user.avatarUrl = githubProfile.avatarUrl;
      }
      await user.save();
    } else {
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const names = (githubProfile.name || githubProfile.username).split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || ' ';

      user = await User.create({
        firstName,
        lastName,
        email: githubProfile.email,
        passwordHash: randomPassword,
        githubId: githubProfile.id,
        githubUsername: githubProfile.username,
        githubAccessToken: accessToken,
        avatarUrl: githubProfile.avatarUrl,
        skills: [],
      });
    }

    const token = generateToken({ id: user.id });
    const userObject = user.toObject() as any;
    delete userObject.passwordHash;
    delete userObject.githubAccessToken;

    return { user: userObject, token };
  },

  async connectAccount(userId: string, githubProfile: any, accessToken: string) {
     const user = await User.findById(userId);
     if (!user) throw new AppError('User not found', 404);

     user.githubId = githubProfile.id;
     user.githubUsername = githubProfile.username;
     user.githubAccessToken = accessToken;
     await user.save();

     const userObject = user.toObject() as any;
     delete userObject.passwordHash;
     delete userObject.githubAccessToken;

     return { user: userObject };
  }
};
