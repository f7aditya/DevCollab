import { api } from "@/lib/api";

export interface PlatformMetrics {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  totalJobs: number;
  totalPosts: number;
  activeUsers: number;
}

export const getPlatformMetrics = async (): Promise<PlatformMetrics> => {
  const response = await api.get(`/admin/analytics`);
  return response.data.metrics;
};
