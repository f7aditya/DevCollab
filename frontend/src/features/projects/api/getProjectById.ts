import { api } from "@/lib/api";
import { Project } from "./getProjects";

export const getProjectById = async (projectId: string): Promise<Project> => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data.project;
};
