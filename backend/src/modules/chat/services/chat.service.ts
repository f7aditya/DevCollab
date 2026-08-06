import { ChannelRepository } from '../repositories/channel.repository';
import { MessageRepository } from '../repositories/message.repository';
import { CreateChannelInput, SendMessageInput } from '../dtos/chat.schema';
import { AppError } from '../../../core/errors/AppError';
import { IChannel } from '../models/Channel';
import { IMessage } from '../models/Message';

export const ChatService = {
  async getChannels(projectId: string): Promise<IChannel[]> {
    return ChannelRepository.findByProject(projectId);
  },

  async createChannel(projectId: string, data: CreateChannelInput): Promise<IChannel> {
    try {
      return await ChannelRepository.create(projectId, data);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('A channel with this name already exists in the project', 400);
      }
      throw error;
    }
  },

  async getMessages(channelId: string, projectId: string, page: number, limit: number): Promise<{ messages: IMessage[], total: number }> {
    const channel = await ChannelRepository.findById(channelId);
    if (!channel) throw new AppError('Channel not found', 404);
    if (channel.projectId.toString() !== projectId) throw new AppError('Channel does not belong to this project', 400);

    const skip = (page - 1) * limit;
    return MessageRepository.findByChannel(channelId, skip, limit);
  },

  async sendMessage(channelId: string, projectId: string, senderId: string, data: SendMessageInput): Promise<IMessage> {
    const channel = await ChannelRepository.findById(channelId);
    if (!channel) throw new AppError('Channel not found', 404);
    if (channel.projectId.toString() !== projectId) throw new AppError('Channel does not belong to this project', 400);

    return MessageRepository.create(channelId, senderId, data);
  }
};
