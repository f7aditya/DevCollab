import { api } from "@/lib/api";
import { Project } from "./getProjects";

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export const updateProject = async (projectId: string, data: UpdateProjectInput): Promise<Project> => {
  const response = await api.patch(`/projects/${projectId}`, data);
  return response.data.project;
};
