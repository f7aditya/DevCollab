"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, Briefcase, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";

import { getGlobalJobs, getMyApplications } from "@/features/jobs/api/getGlobalJobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "applications">("browse");

  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["globalJobs", search],
    queryFn: () => getGlobalJobs(search),
  });

  const { data: appsData, isLoading: isLoadingApps } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => getMyApplications(),
  });

  const jobs = jobsData?.data?.jobs || [];
  const applications = appsData?.data?.applications || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "REJECTED": return "bg-danger/10 text-danger border-danger/20";
      case "PENDING": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-surface-hover text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED": return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case "REJECTED": return <XCircle className="h-4 w-4 mr-1" />;
      case "PENDING": return <Clock className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground mt-1">Discover new opportunities and join amazing projects.</p>
        </div>
      </div>

      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("browse")}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "browse" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
        >
          Browse Jobs
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "applications" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
        >
          My Applications
          {applications.length > 0 && (
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-xs">{applications.length}</span>
          )}
        </button>
      </div>

      {activeTab === "browse" && (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search job titles or descriptions..." 
                className="w-full bg-background pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoadingJobs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-background">
              <div className="h-12 w-12 bg-surface rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No jobs found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm">
                Check back later for new opportunities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job: any) => (
                <div key={job._id} className="p-5 flex flex-col justify-between rounded-xl border border-border bg-background hover:border-primary/50 hover:shadow-md transition-all h-64">
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <Badge variant="secondary" className="shrink-0 ml-2">Active</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <div className="h-2 w-2 rounded-full bg-green-500" />
                       <span className="text-sm font-medium">{job.projectId?.name || "Unknown Project"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.tags?.slice(0, 3).map((tag: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar 
                        src={job.authorId?.avatarUrl} 
                        fallback={job.authorId?.firstName?.[0] || "?"} 
                        className="h-6 w-6" 
                      />
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                        {job.authorId?.firstName} {job.authorId?.lastName}
                      </span>
                    </div>
                    <Link href={`/projects/${job.projectId?._id}/jobs`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "applications" && (
        <div className="space-y-4">
          {isLoadingApps ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-background">
              <div className="h-12 w-12 bg-surface rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No applications</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm">
                You haven't applied to any jobs yet. Browse open roles to get started.
              </p>
              <Button onClick={() => setActiveTab("browse")}>Browse Jobs</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app: any) => (
                <div key={app._id} className="p-6 bg-background rounded-xl border border-border flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{app.jobId?.title || "Unknown Job"}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {app.projectId?.name || "Unknown Project"}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2 text-sm text-muted-foreground">
                    <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                    <Link href={`/projects/${app.projectId?._id}/jobs`}>
                      <Button size="sm" variant="secondary">View Posting</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
