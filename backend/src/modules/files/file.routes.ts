import { Router } from 'express';
import { FileController } from './controllers/file.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/upload', FileController.uploadFile);
router.get('/me', FileController.getMyFiles);

export { router as fileRouter };
