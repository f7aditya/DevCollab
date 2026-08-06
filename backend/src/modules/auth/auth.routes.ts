import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { registerSchema, loginSchema } from './dtos/auth.schema';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);

export { router as authRouter };
