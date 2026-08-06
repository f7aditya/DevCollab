"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Search, Plus, LayoutGrid, List as ListIcon, FolderKanban } from "lucide-react";

import { getMyProjects, Project } from "@/features/projects/api/getProjects";
import { createProject } from "@/features/projects/api/createProject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["projects", "my"],
    queryFn: getMyProjects,
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "my"] });
      setIsCreateOpen(false);
      setFormData({ name: "", description: "" });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const projects = data?.data?.projects || [];
  const filteredProjects = projects.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and view all your workspaces.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="w-full bg-background pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center rounded-md border border-border bg-background p-1">
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded-sm transition-colors ${view === "grid" ? "bg-surface-hover text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-sm transition-colors ${view === "list" ? "bg-surface-hover text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className={view === "grid" ? "h-48 w-full" : "h-20 w-full"} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-background">
          <div className="h-12 w-12 bg-surface rounded-full flex items-center justify-center mb-4">
            <FolderKanban className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No projects found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm">
            Get started by creating a new project workspace.
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>Create Project</Button>
        </div>
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredProjects.map((project) => (
            <Link href={`/projects/${project._id}`} key={project._id} className="group block">
              <div className={`p-5 rounded-xl border border-border bg-background hover:border-primary/50 hover:shadow-md transition-all ${view === "list" ? "flex items-center justify-between h-20" : "flex flex-col justify-between h-48"}`}>
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <Badge variant="secondary" className="shrink-0 ml-2">Active</Badge>
                  </div>
                  {view === "grid" && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {project.description}
                    </p>
                  )}
                </div>
                {view === "grid" && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Setup a new workspace for your team.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">Project Name</label>
            <Input 
              id="name" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Frontend Redesign"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="description">Description</label>
            <Textarea 
              id="description" 
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Briefly describe the project goals..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose onClick={() => setIsCreateOpen(false)} />
      </Dialog>
    </div>
  );
}
