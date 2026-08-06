import { api } from "@/lib/api";

export interface Channel {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  channelId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export const getChannels = async (projectId: string): Promise<Channel[]> => {
  const response = await api.get(`/projects/${projectId}/channels`);
  return response.data.channels;
};

export const createChannel = async (projectId: string, data: { name: string, description?: string }): Promise<Channel> => {
  const response = await api.post(`/projects/${projectId}/channels`, data);
  return response.data.channel;
};

export const getMessages = async (projectId: string, channelId: string): Promise<Message[]> => {
  const response = await api.get(`/projects/${projectId}/channels/${channelId}/messages`);
  return response.data.messages;
};

export const sendMessage = async (projectId: string, channelId: string, content: string): Promise<Message> => {
  const response = await api.post(`/projects/${projectId}/channels/${channelId}/messages`, { content });
  return response.data.message;
};
