import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { OAuthController } from './controllers/oauth.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { registerSchema, loginSchema } from './dtos/auth.schema';

const router = Router();

// Existing Local Auth
router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);

router.get('/oauth/github', OAuthController.getGithubAuthUrl);
router.get('/oauth/github/callback', OAuthController.githubCallback);


export { router as authRouter };
