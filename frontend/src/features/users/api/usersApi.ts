import { api } from "@/lib/api";

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  skills: string[];
  status: string;
  githubUsername?: string;
  githubId?: string;
}

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get(`/users/me`);
  return response.data.user;
};

export const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await api.patch(`/users/me`, data);
  return response.data.user;
};
