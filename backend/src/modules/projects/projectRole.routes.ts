import { Router } from 'express';
import { ProjectRoleController } from './controllers/projectRole.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { protect } from '../../middleware/authMiddleware';
import { restrictToProjectRoles } from '../../middleware/rbacMiddleware';
import { inviteMemberSchema, updateRoleSchema } from './dtos/projectRole.schema';

// This router will be mounted at: /api/v1/projects/:projectId/members
// We need to mergeParams in express if mounted from another router, but since we mount it in app.ts, we can just use the path.
const router = Router({ mergeParams: true });

router.use(protect);

// Anyone in the project can view members
router.get('/', restrictToProjectRoles(), ProjectRoleController.getMembers);

// Only OWNER and ADMIN can invite
router.post('/', 
  restrictToProjectRoles('OWNER', 'ADMIN'), 
  validateRequest(inviteMemberSchema), 
  ProjectRoleController.inviteMember
);

// Only OWNER and ADMIN can update roles (Service logic handles further Owner-specific restrictions)
router.patch('/:userId', 
  restrictToProjectRoles('OWNER', 'ADMIN'), 
  validateRequest(updateRoleSchema), 
  ProjectRoleController.updateMemberRole
);

// Only OWNER and ADMIN can remove members
router.delete('/:userId', 
  restrictToProjectRoles('OWNER', 'ADMIN'), 
  ProjectRoleController.removeMember
);

// Any member can leave the project
router.post('/leave', 
  restrictToProjectRoles(), 
  ProjectRoleController.leaveProject
);

// Only OWNER can transfer ownership
router.post('/transfer-ownership', 
  restrictToProjectRoles('OWNER'), 
  ProjectRoleController.transferOwnership
);

export { router as projectRoleRouter };
