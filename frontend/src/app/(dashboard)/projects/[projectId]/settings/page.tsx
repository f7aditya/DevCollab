// @ts-nocheck
"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectById } from "@/features/projects/api/getProjectById";
import { updateProject } from "@/features/projects/api/updateProject";
import { deleteProject } from "@/features/projects/api/deleteProject";
import { leaveProject, transferOwnership, getMembers } from "@/features/members/api/membersApi";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { LogOut, ArrowRightLeft } from "lucide-react";

export default function ProjectSettingsPage({ params }: { params: { projectId: string } }) {
  const { projectId } = React.use(params) as any;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({ name: "", description: "" });
  
  // Dialog states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => getMembers(projectId),
  });

  useEffect(() => {
    if (project) {
      setFormData({ name: project.name, description: project.description });
    }
  }, [project]);

  const currentUserRole = members.find(m => m.user?._id === user?._id)?.role;
  const isOwner = currentUserRole === "OWNER";
  const isMember = !!currentUserRole;

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", "my"] });
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || "Failed to update project");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "my"] });
      router.push("/projects");
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || "Failed to delete project");
    }
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "my"] });
      router.push("/projects");
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || "Failed to leave project");
    }
  });

  const transferMutation = useMutation({
    mutationFn: () => transferOwnership(projectId, newOwnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectMembers", projectId] });
      setIsTransferOpen(false);
      setNewOwnerId("");
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || "Failed to transfer ownership");
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Update your project details and description.</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdate}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={!isOwner && currentUserRole !== "ADMIN"}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                disabled={!isOwner && currentUserRole !== "ADMIN"}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-6 mt-6 flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending || (!isOwner && currentUserRole !== "ADMIN")}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {!isOwner && isMember && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Project</CardTitle>
            <CardDescription>Revoke your own access to this project.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="text-danger hover:text-danger hover:bg-danger/10" onClick={() => setIsLeaveOpen(true)}>
              <LogOut className="h-4 w-4 mr-2" />
              Leave Project
            </Button>
          </CardContent>
        </Card>
      )}

      {isOwner && (
        <Card className="border-danger/20">
          <CardHeader>
            <CardTitle className="text-danger">Danger Zone</CardTitle>
            <CardDescription>Destructive actions that cannot be easily undone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-medium">Transfer Ownership</h4>
                <p className="text-sm text-muted-foreground">Transfer this project to another member.</p>
              </div>
              <Button variant="outline" onClick={() => setIsTransferOpen(true)}>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Transfer
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
              <div>
                <h4 className="font-medium text-danger">Delete Project</h4>
                <p className="text-sm text-muted-foreground">Permanently delete this project and all data.</p>
              </div>
              <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                Delete Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LEAVE DIALOG */}
      <Dialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen}>
        <DialogHeader>
          <DialogTitle>Leave Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave <strong>{project?.name}</strong>? You will lose all access immediately and need to be re-invited.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsLeaveOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => leaveMutation.mutate()} disabled={leaveMutation.isPending}>
            {leaveMutation.isPending ? "Leaving..." : "Leave Project"}
          </Button>
        </DialogFooter>
        <DialogClose onClick={() => setIsLeaveOpen(false)} />
      </Dialog>

      {/* TRANSFER DIALOG */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogHeader>
          <DialogTitle>Transfer Ownership</DialogTitle>
          <DialogDescription>
            Select a member to transfer ownership to. You will become an ADMIN.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Select value={newOwnerId} onChange={(e) => setNewOwnerId(e.target.value)}>
            <option value="" disabled>Select new owner...</option>
            {members.filter(m => m.user._id !== user?._id).map((member) => (
              <option key={member.user._id} value={member.user._id}>
                {member.user.firstName} {member.user.lastName} ({member.user.email})
              </option>
            ))}
          </Select>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={() => transferMutation.mutate()} 
            disabled={!newOwnerId || transferMutation.isPending}
          >
            {transferMutation.isPending ? "Transferring..." : "Transfer Ownership"}
          </Button>
        </DialogFooter>
        <DialogClose onClick={() => setIsTransferOpen(false)} />
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the <strong>{project?.name}</strong> project, 
            along with all tasks, messages, and associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Yes, delete project"}
          </Button>
        </DialogFooter>
        <DialogClose onClick={() => setIsDeleteOpen(false)} />
      </Dialog>
    </div>
  );
}
