import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';
import { catchAsync } from '../../../core/utils/catchAsync';

export const ChatController = {
  getChannels: catchAsync(async (req: Request, res: Response) => {
    let channels = await ChatService.getChannels(req.params.projectId as string);
    
    // Auto-create a default general channel if none exists (for old projects)
    if (channels.length === 0) {
      const newChannel = await ChatService.createChannel(req.params.projectId as string, {
        name: 'general',
        description: 'General discussion'
      });
      channels = [newChannel];
    }
    
    res.status(200).json({
      success: true,
      message: 'Channels retrieved successfully',
      data: { channels }
    });
  }),

  createChannel: catchAsync(async (req: Request, res: Response) => {
    const channel = await ChatService.createChannel(req.params.projectId as string, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Channel created successfully',
      data: { channel }
    });
  }),

  getMessages: catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const { messages, total } = await ChatService.getMessages(
      req.params.channelId as string, 
      req.params.projectId as string, 
      page, 
      limit
    );
    
    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: { messages, total }
    });
  }),

  sendMessage: catchAsync(async (req: Request, res: Response) => {
    const message = await ChatService.sendMessage(
      req.params.channelId as string, 
      req.params.projectId as string, 
      (req.user as any).id, 
      req.body
    );
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  })
};
