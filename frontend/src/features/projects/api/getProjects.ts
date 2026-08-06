import { api } from "@/lib/api";

export interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  // plus other fields...
}

export interface GetProjectsResponse {
  success: boolean;
  message: string;
  data: {
    projects: Project[];
    total: number;
  };
}

export const getProjects = async (): Promise<GetProjectsResponse> => {
  return await api.get("/projects");
};

export const getMyProjects = async (): Promise<GetProjectsResponse> => {
  return await api.get("/projects/me");
};
