// @ts-nocheck
"use client";

import React from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobs, createJob, updateJob, deleteJob, applyForJob, getApplications, updateApplicationStatus, Job, JobApplication } from "@/features/jobs/api/jobsApi";
import { getMyApplications } from "@/features/jobs/api/getGlobalJobs";
import { getMembers } from "@/features/members/api/membersApi";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Briefcase, MapPin, Users, CheckCircle2, XCircle, Clock, Trash2, Edit2 } from "lucide-react";

export default function JobsPage({ params }: { params: { projectId: string } }) {
  const { projectId } = React.use(params) as any;
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", requirements: "", tags: "", status: "OPEN" });
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Application specific
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplyMode, setIsApplyMode] = useState(false);
  
  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ["jobs", projectId],
    queryFn: () => getJobs(projectId),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => getMembers(projectId),
  });

  // Fetch applications only if the user is OWNER/ADMIN and a job is selected
  const currentUserRole = members.find((m) => m.user._id === user?._id)?.role;
  const canManageJobs = currentUserRole === "OWNER" || currentUserRole === "ADMIN";
  const isMember = members.some(m => m.user._id === user?._id);

  const { data: applications = [], isLoading: isLoadingApps } = useQuery({
    queryKey: ["applications", projectId, selectedJob?._id],
    queryFn: () => selectedJob ? getApplications(projectId, selectedJob._id) : Promise.resolve([]),
    enabled: !!selectedJob && canManageJobs,
  });

  const { data: myAppsData } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => getMyApplications(),
  });
  const myApplications = myAppsData?.data?.applications || [];

  const createJobMutation = useMutation({
    mutationFn: (data: any) => createJob(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", projectId] });
      setIsCreateOpen(false);
      setFormData({ title: "", description: "", requirements: "", tags: "", status: "OPEN" });
    },
    onError: (err: any) => {
      const msg = err?.error?.message || err?.message || "Failed to create job. Please check your inputs.";
      alert(msg);
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: (data: Partial<Job>) => updateJob(projectId, selectedJob!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", projectId] });
      setSelectedJob(null);
      setIsDetailOpen(false);
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => deleteJob(projectId, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", projectId] });
      setIsDetailOpen(false);
    }
  });

  const applyMutation = useMutation({
    mutationFn: () => applyForJob(projectId, selectedJob!._id, coverLetter),
    onSuccess: () => {
      setIsApplyMode(false);
      setCoverLetter("");
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
      alert("Application submitted successfully!");
    },
    onError: (err: any) => {
      const msg = err?.error?.details?.[0]?.message || err?.error?.message || err?.message || "Failed to apply";
      alert(msg);
    }
  });

  const updateAppStatusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string, status: any }) => updateApplicationStatus(projectId, selectedJob!._id, appId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", projectId, selectedJob?._id] });
    }
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(Boolean);
    const reqsArray = formData.requirements.split("\n").map(t => t.trim()).filter(Boolean);
    createJobMutation.mutate({ ...formData, tags: tagsArray, requirements: reqsArray });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "CLOSED": return "bg-surface-hover text-muted-foreground border-border";
      case "DRAFT": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "ACCEPTED": return "text-green-500";
      case "REJECTED": return "text-danger";
      default: return "bg-surface-hover text-muted-foreground";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recruitment & Roles</h2>
          <p className="text-muted-foreground mt-1">Discover open roles or recruit new talent for this project.</p>
        </div>
        {canManageJobs && (
          <Button onClick={() => setIsCreateOpen(true)} className="shrink-0 shadow-sm">
            Post a Job
          </Button>
        )}
      </div>

      {/* Jobs Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoadingJobs ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-background rounded-xl border border-border space-y-4 shadow-sm h-[200px]">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <div className="pt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          ))
        ) : jobs.length === 0 ? (
          <div className="col-span-full p-12 text-center text-muted-foreground flex flex-col items-center bg-background border border-border rounded-xl border-dashed">
            <Briefcase className="h-12 w-12 opacity-20 mb-4" />
            <p>No open roles at the moment.</p>
          </div>
        ) : (
          <>
            {jobs.map((job) => (
              <div
                key={job._id}
                className="flex flex-col p-6 bg-background rounded-xl border border-border shadow-sm hover:border-primary/40 transition-all cursor-pointer group"
                onClick={() => { setSelectedJob(job); setIsDetailOpen(true); setIsApplyMode(false); }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                
                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed flex-1">
                  {job.description}
                </p>

                <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap gap-2">
                  {job.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal bg-surface hover:bg-surface">{tag}</Badge>
                  ))}
                  {job.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs font-normal">+{job.tags.length - 3}</Badge>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* CREATE JOB MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogHeader>
          <DialogTitle>Post a Job Role</DialogTitle>
          <DialogDescription>Create a new role to recruit members to your project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateJob} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Title</label>
            <Input 
              required 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role and responsibilities..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Requirements (One per line)</label>
            <Textarea 
              rows={4}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="React.js experience&#10;TypeScript knowledge"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <Input 
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g. frontend, react, remote"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createJobMutation.isPending}>
              {createJobMutation.isPending ? "Posting..." : "Post Job"}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose onClick={() => setIsCreateOpen(false)} />
      </Dialog>

      {/* JOB DETAIL & APPLICATION DRAWER */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {selectedJob && (
          <div className="flex flex-col h-full max-h-[80vh]">
            <DialogHeader className="border-b border-border pb-4 shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(selectedJob.status)}`}>
                      {selectedJob.status}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Posted {new Date(selectedJob.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
                </div>
                {canManageJobs && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newStatus = selectedJob.status === "OPEN" ? "CLOSED" : "OPEN";
                        updateJobMutation.mutate({ status: newStatus });
                      }}
                    >
                      Mark {selectedJob.status === "OPEN" ? "Closed" : "Open"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-danger hover:bg-danger/10 h-8 w-8 p-0"
                      onClick={() => deleteJobMutation.mutate(selectedJob._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-6 pr-2 space-y-8">
              {!isApplyMode ? (
                <>
                  <section>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">About the Role</h4>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 bg-surface/50 p-4 rounded-lg border border-border/50">
                      {selectedJob.description}
                    </div>
                  </section>
                  
                  {selectedJob.requirements.length > 0 && (
                    <section>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Requirements</h4>
                      <ul className="space-y-2">
                        {selectedJob.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-foreground/90">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {canManageJobs && (
                    <section className="pt-6 border-t border-border">
                      <h4 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Applications ({applications.length})
                      </h4>
                      <div className="space-y-3">
                        {isLoadingApps ? (
                          <Skeleton className="h-16 w-full" />
                        ) : applications.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">No applications yet.</p>
                        ) : (
                          applications.map(app => (
                            <div key={app._id} className="p-4 bg-surface rounded-lg border border-border">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-sm">Applicant: {typeof app.applicantId === 'object' ? `${(app.applicantId as any).firstName} ${(app.applicantId as any).lastName}` : app.applicantId}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(app.status)}`}>
                                    {app.status}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-4 bg-background p-3 rounded">{app.coverLetter}</p>
                              <div className="flex gap-2">
                                {app.status !== "ACCEPTED" && (
                                  <Button size="sm" variant="outline" className="text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => updateAppStatusMutation.mutate({ appId: app._id, status: "ACCEPTED" })}>
                                    <CheckCircle2 className="h-4 w-4 mr-1" /> Accept
                                  </Button>
                                )}
                                {app.status !== "REJECTED" && (
                                  <Button size="sm" variant="outline" className="text-danger hover:text-danger hover:bg-danger/10" onClick={() => updateAppStatusMutation.mutate({ appId: app._id, status: "REJECTED" })}>
                                    <XCircle className="h-4 w-4 mr-1" /> Reject
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-foreground">Submit Application</h4>
                  <p className="text-sm text-muted-foreground mb-4">Write a brief cover letter explaining why you are a great fit for the <strong>{selectedJob.title}</strong> role.</p>
                  <Textarea 
                    rows={8}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="I am interested in this role because..."
                    className="bg-surface"
                  />
                  <div className="flex gap-3 pt-4">
                    <Button variant="ghost" onClick={() => setIsApplyMode(false)}>Cancel</Button>
                    <Button 
                      onClick={() => applyMutation.mutate()} 
                      disabled={!coverLetter.trim() || applyMutation.isPending}
                    >
                      {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {!canManageJobs && !isApplyMode && (
              <DialogFooter className="pt-4 border-t border-border shrink-0">
                <Button 
                  className="w-full sm:w-auto"
                  onClick={() => setIsApplyMode(true)}
                  disabled={selectedJob.status !== "OPEN" || myApplications.some((app: any) => app.jobId === selectedJob._id || (app.jobId as any)?._id === selectedJob._id)}
                >
                  {selectedJob.status !== "OPEN" ? "Role Closed" : (myApplications.some((app: any) => app.jobId === selectedJob._id || (app.jobId as any)?._id === selectedJob._id) ? "Already Applied" : "Apply for Role")}
                </Button>
              </DialogFooter>
            )}
            
            <DialogClose onClick={() => { setIsDetailOpen(false); setIsApplyMode(false); }} />
          </div>
        )}
      </Dialog>
    </div>
  );
}
