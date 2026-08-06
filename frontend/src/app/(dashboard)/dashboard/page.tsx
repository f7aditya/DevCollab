"use client";

import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getMyProjects } from "@/features/projects/api/getProjects";
import { FolderKanban, Plus, Clock, FileText } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["projects", "my"],
    queryFn: getMyProjects,
  });

  const projects = data?.data?.projects || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.firstName}. Here is what's happening in your workspaces.
          </p>
        </div>
        <Link href="/projects">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* RECENT PROJECTS CARD */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" />
                Recent Projects
              </CardTitle>
              <CardDescription>Projects you are a member of.</CardDescription>
            </div>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-muted-foreground">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {projects.map((project: any) => {
                  const joinedDate = new Date(project.joinedAt);
                  const daysWorked = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
                  const formattedDate = joinedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  
                  return (
                  <Link href={`/projects/${project._id}`} key={project._id}>
                    <div className="p-4 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors flex flex-col justify-between cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{project.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
                        </div>
                        <Badge variant="secondary" className="uppercase text-[10px] tracking-wider shrink-0 ml-4">{project.myRole}</Badge>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          Joined {formattedDate} ({daysWorked} days)
                        </div>
                        <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">Active</Badge>
                      </div>
                    </div>
                  </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-lg">
                <div className="h-10 w-10 bg-surface rounded-full flex items-center justify-center mb-3">
                  <FolderKanban className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground">No projects found</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">You haven't joined any projects yet.</p>
                <Link href="/projects">
                  <Button variant="outline" size="sm">Create your first project</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* QUICK ACTIONS & NOTIFICATIONS */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Tasks Due Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-muted-foreground">You are all caught up.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/jobs" className="w-full">
                  <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground">
                    Browse Job Postings
                  </Button>
                </Link>
                <Button variant="secondary" className="w-full justify-start text-muted-foreground hover:text-danger" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
