import { Router } from 'express';
import { PostController } from './controllers/post.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { protect } from '../../middleware/authMiddleware';
import { restrictToProjectRoles } from '../../middleware/rbacMiddleware';
import { createPostSchema, updatePostSchema, createCommentSchema } from './dtos/post.schema';

const router = Router({ mergeParams: true });

router.use(protect);

// POSTS
router.get('/', restrictToProjectRoles(), PostController.getPosts);
router.get('/:postId', restrictToProjectRoles(), PostController.getPost);

router.post('/', 
  restrictToProjectRoles('OWNER', 'ADMIN', 'MAINTAINER', 'MEMBER'), 
  validateRequest(createPostSchema), 
  PostController.createPost
);

router.patch('/:postId', 
  restrictToProjectRoles('OWNER', 'ADMIN', 'MAINTAINER', 'MEMBER'), 
  validateRequest(updatePostSchema), 
  PostController.updatePost
);

router.delete('/:postId', 
  restrictToProjectRoles('OWNER', 'ADMIN', 'MAINTAINER', 'MEMBER'), 
  PostController.deletePost
);

// COMMENTS
router.get('/:postId/comments', restrictToProjectRoles(), PostController.getComments);

router.post('/:postId/comments', 
  restrictToProjectRoles('OWNER', 'ADMIN', 'MAINTAINER', 'MEMBER'), 
  validateRequest(createCommentSchema), 
  PostController.createComment
);

router.delete('/:postId/comments/:commentId', 
  restrictToProjectRoles('OWNER', 'ADMIN', 'MAINTAINER', 'MEMBER'), 
  PostController.deleteComment
);

export { router as postRouter };
