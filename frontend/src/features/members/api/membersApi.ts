import { api } from "@/lib/api";

export interface ProjectMember {
  _id: string; // The ProjectRole document ID
  project: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: "OWNER" | "ADMIN" | "MAINTAINER" | "MEMBER" | "VIEWER";
  createdAt: string;
}

export const getMembers = async (projectId: string): Promise<ProjectMember[]> => {
  const response = await api.get(`/projects/${projectId}/members`);
  return response.data.members.map((m: any) => ({
    ...m,
    user: m.userId || m.user // Handle both in case it's populated as userId
  }));
};

export const inviteMember = async (projectId: string, data: { userId: string, role: string }): Promise<ProjectMember> => {
  const response = await api.post(`/projects/${projectId}/members`, data);
  const m = response.data.member;
  return { ...m, user: m.userId || m.user };
};

export const updateMemberRole = async (projectId: string, userId: string, role: string): Promise<ProjectMember> => {
  const response = await api.patch(`/projects/${projectId}/members/${userId}`, { role });
  const m = response.data.member;
  return { ...m, user: m.userId || m.user };
};

export const removeMember = async (projectId: string, userId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/members/${userId}`);
};

export const leaveProject = async (projectId: string): Promise<void> => {
  await api.post(`/projects/${projectId}/members/leave`);
};

export const transferOwnership = async (projectId: string, newOwnerId: string): Promise<void> => {
  await api.post(`/projects/${projectId}/members/transfer-ownership`, { newOwnerId });
};
