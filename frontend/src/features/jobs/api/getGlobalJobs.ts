import { api } from "@/lib/api";

export interface GlobalJob {
  _id: string;
  projectId: { _id: string; name: string };
  authorId: { _id: string; firstName: string; lastName: string; avatarUrl?: string };
  title: string;
  description: string;
  requirements: string[];
  status: string;
  tags: string[];
  createdAt: string;
}

export interface GetGlobalJobsResponse {
  success: boolean;
  message: string;
  data: {
    jobs: GlobalJob[];
    total: number;
  };
}

export const getGlobalJobs = async (search?: string): Promise<GetGlobalJobsResponse> => {
  const url = search ? `/jobs?search=${encodeURIComponent(search)}` : `/jobs`;
  return await api.get(url);
};

export const getMyApplications = async (): Promise<any> => {
  return await api.get(`/jobs/applications/me`);
};
