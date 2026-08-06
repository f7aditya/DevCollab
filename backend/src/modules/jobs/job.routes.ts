import { Router } from 'express';
import { JobController } from './controllers/job.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { protect } from '../../middleware/authMiddleware';
import { restrictToProjectRoles } from '../../middleware/rbacMiddleware';
import { createJobSchema, updateJobSchema, applyForJobSchema, updateApplicationStatusSchema } from './dtos/job.schema';

const router = Router({ mergeParams: true });

router.use(protect);

// ---- JOBS ----
// Anyone can view jobs (even viewers, if public could even bypass project roles, but we'll leave it simple for now)
router.get('/', JobController.getJobs);
router.get('/:jobId', JobController.getJob);

// Only admins and owners can manage jobs
router.post('/', 
  restrictToProjectRoles('OWNER', 'ADMIN'), 
  validateRequest(createJobSchema), 
  JobController.createJob
);

router.patch('/:jobId', 
  restrictToProjectRoles('OWNER', 'ADMIN'), 
  validateRequest(updateJobSchema), 
  JobController.updateJob
);

router.delete('/:jobId', 
  restrictToProjectRoles('OWNER', 'ADMIN'), 
  JobController.deleteJob
);

// ---- APPLICATIONS ----
// Any authenticated user who is NOT in the project can apply (logic handled in service)
router.post('/:jobId/apply', 
  validateRequest(applyForJobSchema), 
  JobController.applyForJob
);

// Only admins and owners can view/manage applications
router.get('/:jobId/applications', 
  restrictToProjectRoles('OWNER', 'ADMIN'), 
  JobController.getApplications
);

router.patch('/:jobId/applications/:applicationId', 
  restrictToProjectRoles('OWNER', 'ADMIN'), 
  validateRequest(updateApplicationStatusSchema),
  JobController.updateApplicationStatus
);

export { router as jobRouter };
