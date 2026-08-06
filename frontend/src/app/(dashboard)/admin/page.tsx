"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlatformMetrics } from "@/features/admin/api/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  Briefcase, 
  FileText, 
  Activity,
  TrendingUp,
  ShieldAlert
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: getPlatformMetrics,
  });

  const statCards = [
    { title: "Total Users", value: metrics?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Users", value: metrics?.activeUsers || 0, icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Total Projects", value: metrics?.totalProjects || 0, icon: FolderKanban, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Tasks Created", value: metrics?.totalTasks || 0, icon: CheckCircle2, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Job Postings", value: metrics?.totalJobs || 0, icon: Briefcase, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { title: "Forum Posts", value: metrics?.totalPosts || 0, icon: FileText, color: "text-pink-500", bg: "bg-pink-500/10" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-16">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-danger" />
            Administration Console
          </h1>
          <p className="text-muted-foreground mt-2">
            Platform-wide metrics and analytics for global administrators.
          </p>
        </div>
        
        <div className="bg-surface px-4 py-2 rounded-lg border border-border flex items-center gap-3 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-foreground">System Healthy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-full mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, i) => (
            <div
              key={stat.title}
            >
              <Card className="hover:border-primary/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-4xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-medium">+12%</span> from last month
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Placeholder for future graphs/charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
        <Card className="min-h-[300px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">User Growth Trajectory</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center border-t border-border/50 bg-surface/30">
            <p className="text-muted-foreground text-sm italic">Chart visualization module pending deployment...</p>
          </CardContent>
        </Card>

        <Card className="min-h-[300px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Platform Engagement</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center border-t border-border/50 bg-surface/30">
            <p className="text-muted-foreground text-sm italic">Engagement metrics module pending deployment...</p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
