import { api } from "@/lib/api";

export const deleteProject = async (projectId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}`);
};
