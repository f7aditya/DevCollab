import { Router } from 'express';
import { TaskController } from './controllers/task.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { protect } from '../../middleware/authMiddleware';
import { restrictToProjectRoles } from '../../middleware/rbacMiddleware';
import { createTaskSchema, updateTaskSchema } from './dtos/task.schema';

const router = Router({ mergeParams: true });

router.use(protect);

// All members can view tasks
router.get('/', restrictToProjectRoles(), TaskController.getTasks);
router.get('/:taskId', restrictToProjectRoles(), TaskController.getTask);

// Active members can create and update tasks
router.post('/', 
  restrictToProjectRoles('OWNER', 'ADMIN', 'MAINTAINER', 'MEMBER'), 
  validateRequest(createTaskSchema), 
  TaskController.createTask
);

router.patch('/:taskId', 
  restrictToProjectRoles('OWNER', 'ADMIN', 'MAINTAINER', 'MEMBER'), 
  validateRequest(updateTaskSchema), 
  TaskController.updateTask
);

// Batch update tasks (reorder)
router.patch('/batch/reorder', 
  restrictToProjectRoles('OWNER', 'ADMIN', 'MAINTAINER', 'MEMBER'), 
  TaskController.reorderTasks
);

// Only admins and owners can delete tasks
router.delete('/:taskId', 
  restrictToProjectRoles('OWNER', 'ADMIN'), 
  TaskController.deleteTask
);

export { router as taskRouter };
