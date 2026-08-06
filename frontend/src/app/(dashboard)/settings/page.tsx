// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "@/features/users/api/usersApi";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Save, User, Shield, Key } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/features/files/components/FileUpload";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const setAuthUser = useAuthStore(state => state.setUser);
  
  const [activeTab, setActiveTab] = useState("profile");

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

          </div>

        </div>
      </div>
    </div>
  );
}
