import mongoose from 'mongoose';
import { Channel, IChannel } from '../models/Channel';
import { CreateChannelInput } from '../dtos/chat.schema';

export const ChannelRepository = {
  async create(projectId: string, data: CreateChannelInput, session?: mongoose.mongo.ClientSession): Promise<IChannel> {
    const channel = new Channel({ ...data, projectId });
    return channel.save({ session });
  },

  async findByProject(projectId: string): Promise<IChannel[]> {
    return Channel.find({ projectId }).sort({ name: 1 }).lean();
  },

  async findById(channelId: string): Promise<IChannel | null> {
    return Channel.findById(channelId).lean();
  },

  async deleteById(channelId: string): Promise<IChannel | null> {
    return Channel.findByIdAndDelete(channelId).lean();
  }
};
