import { Router } from 'express';
import { SearchController } from './controllers/search.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', SearchController.globalSearch);

export { router as searchRouter };
