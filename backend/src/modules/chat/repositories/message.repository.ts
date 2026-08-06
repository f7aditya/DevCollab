import { Message, IMessage } from '../models/Message';
import { SendMessageInput } from '../dtos/chat.schema';

export const MessageRepository = {
  async create(channelId: string, senderId: string, data: SendMessageInput): Promise<IMessage> {
    const message = new Message({ ...data, channelId, senderId });
    return message.save();
  },

  async findByChannel(channelId: string, skip: number, limit: number): Promise<{ messages: IMessage[], total: number }> {
    const [messages, total] = await Promise.all([
      Message.find({ channelId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'firstName lastName avatarUrl')
        .lean(),
      Message.countDocuments({ channelId })
    ]);
    return { messages, total };
  },

  async deleteByChannel(channelId: string): Promise<void> {
    await Message.deleteMany({ channelId });
  }
};
