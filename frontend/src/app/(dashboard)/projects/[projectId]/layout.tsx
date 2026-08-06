// @ts-nocheck
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "@/features/projects/api/getProjectById";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const projectTabs = [
  { name: "Overview", href: "" },
  { name: "Tasks", href: "/tasks" },
  { name: "Channels", href: "/channels" },
  { name: "Jobs", href: "/jobs" },
  { name: "Members", href: "/members" },
  { name: "Settings", href: "/settings" },
];

export default function ProjectDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const pathname = usePathname();
  const { projectId } = React.use(params) as any;
  
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
  });

  const baseUrl = `/projects/${projectId}`;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Project Header */}
      <div className="border-b border-border bg-background pt-8 px-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="space-y-2 mb-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          ) : (
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">{project?.name}</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl line-clamp-1">
                {project?.description}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-6 overflow-x-auto">
            {projectTabs.map((tab) => {
              const href = `${baseUrl}${tab.href}`;
              const isActive = pathname === href;

              return (
                <Link
                  key={tab.name}
                  href={href}
                  className={cn(
                    "pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Project Content */}
      <div className="flex-1 overflow-y-auto bg-surface/30 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
