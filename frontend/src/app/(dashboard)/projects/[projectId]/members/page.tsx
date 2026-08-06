// @ts-nocheck
"use client";

import React from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMembers, inviteMember, updateMemberRole, removeMember, ProjectMember } from "@/features/members/api/membersApi";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Search, UserPlus, MoreHorizontal, ShieldAlert, Shield } from "lucide-react";

const ROLE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  OWNER: "destructive",
  ADMIN: "default",
  MAINTAINER: "secondary",
  MEMBER: "outline",
  VIEWER: "outline",
};

export default function MembersPage({ params }: { params: { projectId: string } }) {
  const { projectId } = React.use(params) as any;
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  
  // Dialog States
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ userId: "", role: "MEMBER" });
  
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => getMembers(projectId),
  });

  const currentUserRole = members.find((m) => m.user._id === user?._id)?.role;
  const canManageRoles = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: (data: { userId: string, role: string }) => inviteMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectMembers", projectId] });
      setIsInviteOpen(false);
      setInviteData({ userId: "", role: "MEMBER" });
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: string }) => updateMemberRole(projectId, userId, role),
    onMutate: async ({ userId, role }) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ["projectMembers", projectId] });
      const previousMembers = queryClient.getQueryData<ProjectMember[]>(["projectMembers", projectId]);
      
      queryClient.setQueryData<ProjectMember[]>(["projectMembers", projectId], (old) => {
        if (!old) return [];
        return old.map(m => m.user._id === userId ? { ...m, role: role as any } : m);
      });
      return { previousMembers };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["projectMembers", projectId], context?.previousMembers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projectMembers", projectId] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectMembers", projectId] });
      setIsRemoveOpen(false);
      setMemberToRemove(null);
    }
  });

  const filteredMembers = members.filter((m) => {
    const matchesSearch = `${m.user.firstName} ${m.user.lastName} ${m.user.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate(inviteData);
  };

  const confirmRemove = () => {
    if (memberToRemove) {
      removeMutation.mutate(memberToRemove.user._id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground mt-1">Manage who has access to this project.</p>
        </div>
        {canManageRoles && (
          <Button className="gap-2" onClick={() => setIsInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search members by name or email..." 
            className="pl-9 w-full bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">All Roles</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="MAINTAINER">Maintainer</option>
            <option value="MEMBER">Member</option>
            <option value="VIEWER">Viewer</option>
          </Select>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-background overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <Shield className="h-12 w-12 opacity-20 mb-4" />
            <p>No members found matching your search.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredMembers.map((member) => (
              <div key={member.user._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar fallback={`${member.user.firstName[0]}${member.user.lastName[0]}`} />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background"></span>
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {member.user.firstName} {member.user.lastName}
                      {member.user._id === user?._id && <Badge variant="outline" className="text-[10px] h-5">You</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">{member.user.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground hidden md:block mr-4">
                    Joined {new Date(member.createdAt).toLocaleDateString()}
                  </div>
                  
                  {canManageRoles && member.role !== "OWNER" && member.user._id !== user?._id ? (
                    <Select 
                      className="w-32 h-8 text-xs" 
                      value={member.role}
                      onChange={(e) => updateRoleMutation.mutate({ userId: member.user._id, role: e.target.value })}
                      disabled={updateRoleMutation.isPending}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MAINTAINER">Maintainer</option>
                      <option value="MEMBER">Member</option>
                      <option value="VIEWER">Viewer</option>
                    </Select>
                  ) : (
                    <Badge variant={ROLE_COLORS[member.role]}>{member.role}</Badge>
                  )}
                  
                  {canManageRoles && member.role !== "OWNER" && member.user._id !== user?._id && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-danger h-8 w-8 p-0"
                      onClick={() => {
                        setMemberToRemove(member);
                        setIsRemoveOpen(true);
                      }}
                    >
                      <ShieldAlert className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INVITE MODAL */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>Invite a new user to collaborate on this project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">User ID (or Email if supported by backend)</label>
            <Input 
              required 
              value={inviteData.userId}
              onChange={(e) => setInviteData({ ...inviteData, userId: e.target.value })}
              placeholder="User ID..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select 
              value={inviteData.role}
              onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
            >
              <option value="ADMIN">Admin</option>
              <option value="MAINTAINER">Maintainer</option>
              <option value="MEMBER">Member</option>
              <option value="VIEWER">Viewer</option>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? "Inviting..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose onClick={() => setIsInviteOpen(false)} />
      </Dialog>

      {/* REMOVE MODAL */}
      <Dialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{memberToRemove?.user.firstName}</strong> from this project? 
            They will lose all access immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={() => setIsRemoveOpen(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={confirmRemove}
            disabled={removeMutation.isPending}
          >
            {removeMutation.isPending ? "Removing..." : "Remove Member"}
          </Button>
        </DialogFooter>
        <DialogClose onClick={() => setIsRemoveOpen(false)} />
      </Dialog>
    </div>
  );
}
