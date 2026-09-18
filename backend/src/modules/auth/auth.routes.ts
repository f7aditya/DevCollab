import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { OAuthController } from './controllers/oauth.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { registerSchema, loginSchema } from './dtos/auth.schema';

const router = Router();

// Existing Local Auth
router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);

// Global OAuth Auth
router.get('/oauth/google', OAuthController.getGoogleAuthUrl);
router.get('/oauth/google/callback', OAuthController.googleCallback);

router.get('/oauth/github', OAuthController.getGithubAuthUrl);
router.get('/oauth/github/callback', OAuthController.githubCallback);

router.get('/oauth/linkedin', OAuthController.getLinkedinAuthUrl);
router.get('/oauth/linkedin/callback', OAuthController.linkedinCallback);

export { router as authRouter };
