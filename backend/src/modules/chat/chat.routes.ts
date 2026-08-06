import { Router } from 'express';
import { ChatController } from './controllers/chat.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { protect } from '../../middleware/authMiddleware';
import { restrictToProjectRoles } from '../../middleware/rbacMiddleware';
import { createChannelSchema, sendMessageSchema } from './dtos/chat.schema';

const router = Router({ mergeParams: true });

router.use(protect);

// ---- CHANNEL ROUTES ----
// Active members can view channels
router.get('/', restrictToProjectRoles('OWNER', 'ADMIN', 'MAINTAINER', 'MEMBER'), ChatController.getChannels);

// Only admins and owners can create channels
router.post('/', 
  restrictToProjectRoles('OWNER', 'ADMIN'), 
  validateRequest(createChannelSchema), 
  ChatController.createChannel
);


// ---- MESSAGE ROUTES ----
// Active members can view and send messages
router.get('/:channelId/messages', 
  restrictToProjectRoles('OWNER', 'ADMIN', 'MAINTAINER', 'MEMBER'), 
  ChatController.getMessages
);

router.post('/:channelId/messages', 
  restrictToProjectRoles('OWNER', 'ADMIN', 'MAINTAINER', 'MEMBER'), 
  validateRequest(sendMessageSchema), 
  ChatController.sendMessage
);

export { router as chatRouter };
