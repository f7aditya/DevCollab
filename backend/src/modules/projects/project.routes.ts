import { Router } from 'express';
import { ProjectController } from './controllers/project.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { protect } from '../../middleware/authMiddleware';
import { createProjectSchema, updateProjectSchema } from './dtos/project.schema';

const router = Router();

// All project routes require authentication
router.use(protect);

router.post('/', validateRequest(createProjectSchema), ProjectController.createProject);
router.get('/', ProjectController.getAllProjects);
router.get('/me', ProjectController.getMyProjects);
router.get('/:id', ProjectController.getProject);
router.patch('/:id', validateRequest(updateProjectSchema), ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

export { router as projectRouter };
