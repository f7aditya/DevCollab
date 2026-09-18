// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { getProfile, updateProfile } from "@/features/users/api/usersApi";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Save, User, Shield, Key, Github } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/features/files/components/FileUpload";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const setAuthUser = useAuthStore(state => state.setUser);
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const error = searchParams?.get("error");
    if (error === "github_already_linked") {
      alert("This GitHub account is already linked to another DevConnect user.");
      // optionally clean up the URL here
    } else if (error === "connection_failed") {
      alert("Failed to connect GitHub account.");
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    skills: "",
    avatarUrl: ""
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getProfile,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        bio: profile.bio || "",
        skills: profile.skills ? profile.skills.join(", ") : "",
        avatarUrl: profile.avatarUrl || ""
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setAuthUser(updatedUser as any); // Sync with auth store so global UI (TopNav, etc) updates
      alert("Profile updated successfully!");
    },
    onError: (err: any) => {
      alert("Failed to update profile: " + (err.message || JSON.stringify(err)));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(Boolean);
    updateMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      bio: formData.bio,
      avatarUrl: formData.avatarUrl,
      skills: skillsArray
    });
  };

  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const handleDisconnectGithub = async () => {
    if (!confirm("Are you sure you want to disconnect your GitHub account?")) return;
    
    setIsDisconnecting(true);
    try {
      const { api } = await import('@/lib/api');
      await api.delete("/integrations/github/disconnect");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      alert("GitHub disconnected successfully!");
    } catch (err) {
      alert("Failed to disconnect GitHub");
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your public profile, preferences, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="hidden md:flex flex-col space-y-2">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "profile" ? "bg-surface-hover text-foreground" : "text-muted-foreground hover:bg-surface-hover/50 hover:text-foreground"}`}
          >
            <User className="h-4 w-4" /> Public Profile
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "security" ? "bg-surface-hover text-foreground" : "text-muted-foreground hover:bg-surface-hover/50 hover:text-foreground"}`}
          >
            <Key className="h-4 w-4" /> Security
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "notifications" ? "bg-surface-hover text-foreground" : "text-muted-foreground hover:bg-surface-hover/50 hover:text-foreground"}`}
          >
            <Shield className="h-4 w-4" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab("integrations")}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "integrations" ? "bg-surface-hover text-foreground" : "text-muted-foreground hover:bg-surface-hover/50 hover:text-foreground"}`}
          >
            <Github className="h-4 w-4" /> Integrations
          </button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-8">
          
          <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
            
            {activeTab === "profile" && (
              <>
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-border/50">
                    <Avatar 
                      src={formData.avatarUrl}
                      fallback={`${formData.firstName[0] || ""}${formData.lastName[0] || ""}`} 
                      className="h-24 w-24 text-2xl border-4 border-surface shadow-sm"
                    />
                    <div className="space-y-3 flex-1 w-full">
                      <label className="text-sm font-medium text-muted-foreground">Update Avatar</label>
                      <FileUpload 
                        accept="image/*"
                        maxSizeMB={2}
                        onUploadSuccess={(url) => setFormData({ ...formData, avatarUrl: url })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input 
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input 
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input 
                      value={profile?.email || ""}
                      disabled
                      className="bg-surface text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">Email addresses cannot be changed currently.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea 
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      placeholder="Tell us a little bit about yourself..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Skills (comma separated)</label>
                    <Input 
                      value={formData.skills}
                      onChange={e => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="React, TypeScript, Node.js"
                    />
                    {formData.skills && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.skills.split(",").map((s, i) => s.trim() && (
                          <Badge key={i} variant="secondary" className="bg-surface">{s.trim()}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateMutation.isPending}
                      className="w-full sm:w-auto min-w-[120px]"
                    >
                      {updateMutation.isPending ? "Saving..." : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {activeTab === "security" && (
              <div className="py-12 text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium text-foreground">Security Settings</h3>
                <p className="mt-2 text-sm">Security settings will be available in a future update.</p>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="py-12 text-center text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium text-foreground">Notification Preferences</h3>
                <p className="mt-2 text-sm">Notification preferences will be available in a future update.</p>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Integrations</h2>
                <div className="border border-border rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Github className="h-8 w-8" />
                    <div>
                      <h3 className="font-medium text-lg">GitHub</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.githubUsername 
                          ? `Connected as @${profile.githubUsername}` 
                          : "Connect your GitHub account to automatically collaborate on project repositories."}
                      </p>
                    </div>
                  </div>
                  <div>
                    {profile?.githubUsername ? (
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
                          Connected
                        </Badge>
                        <Button variant="outline" size="sm" onClick={handleDisconnectGithub} disabled={isDisconnecting}>
                          {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => {
                          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
                          const token = Cookies.get('token') || '';
                          if (!token) {
                            alert("You must be logged in to connect GitHub.");
                            return;
                          }
                          window.location.href = `${API_URL}/integrations/github/connect?token=${token}`;
                        }}
                      >
                        Connect GitHub
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
