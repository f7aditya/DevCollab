import { api } from "@/lib/api";

export type JobStatus = "OPEN" | "CLOSED" | "DRAFT";
export type ApplicationStatus = "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED";

export interface Job {
  _id: string;
  projectId: string;
  authorId: string;
  title: string;
  description: string;
  requirements: string[];
  status: JobStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  _id: string;
  jobId: string;
  applicantId: string;
  projectId: string;
  coverLetter: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  applicant?: { // Populated dynamically in UI or backend
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const getJobs = async (projectId: string): Promise<Job[]> => {
  const response = await api.get(`/projects/${projectId}/jobs`);
  return response.data.jobs;
};

export const createJob = async (projectId: string, data: Partial<Job>): Promise<Job> => {
  const response = await api.post(`/projects/${projectId}/jobs`, data);
  return response.data.job;
};

export const updateJob = async (projectId: string, jobId: string, data: Partial<Job>): Promise<Job> => {
  const response = await api.patch(`/projects/${projectId}/jobs/${jobId}`, data);
  return response.data.job;
};

export const deleteJob = async (projectId: string, jobId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/jobs/${jobId}`);
};

export const applyForJob = async (projectId: string, jobId: string, coverLetter: string): Promise<JobApplication> => {
  const response = await api.post(`/projects/${projectId}/jobs/${jobId}/apply`, { coverLetter });
  return response.data.application;
};

export const getApplications = async (projectId: string, jobId: string): Promise<JobApplication[]> => {
  const response = await api.get(`/projects/${projectId}/jobs/${jobId}/applications`);
  return response.data.applications;
};

export const updateApplicationStatus = async (projectId: string, jobId: string, applicationId: string, status: ApplicationStatus): Promise<JobApplication> => {
  const response = await api.patch(`/projects/${projectId}/jobs/${jobId}/applications/${applicationId}`, { status });
  return response.data.application;
};
