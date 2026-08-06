import { api } from "@/lib/api";
import { Project } from "./getProjects";

export interface CreateProjectInput {
  name: string;
  description: string;
}

export const createProject = async (data: CreateProjectInput): Promise<Project> => {
  const response = await api.post("/projects", data);
  return response.data.project;
};
