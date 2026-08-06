// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, CheckCircle2, MessageSquare, Briefcase, FileText, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead, markAllAsRead, Notification } from "@/features/notifications/api/notificationsApi";
import { CommandPalette } from "@/features/search/components/CommandPalette";

export function TopNav() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Add global CMD+K listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 15000,
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case "TASK": return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "CHAT": return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "POST": return <FileText className="h-4 w-4 text-orange-500" />;
      case "JOB": return <Briefcase className="h-4 w-4 text-purple-500" />;
      default: return <Settings className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-sm">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center w-full bg-surface pl-3 pr-2 py-2 rounded-md border border-transparent hover:border-border transition-colors text-muted-foreground"
          >
            <Search className="h-4 w-4 mr-2 shrink-0" />
            <span className="text-sm flex-1 text-left">Search across workspace...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 bg-background border border-border rounded px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-70">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`relative rounded-full p-2 transition-colors ${isDropdownOpen ? 'bg-surface-hover text-foreground' : 'text-muted-foreground hover:bg-surface-hover'}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-background"></span>
            )}
          </button>

          
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-background rounded-xl shadow-xl border border-border overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <Bell className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                      <p className="text-sm text-muted-foreground">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.map((notification) => (
                        <div 
                          key={notification._id} 
                          className={`p-4 flex gap-3 hover:bg-surface-hover/50 transition-colors cursor-pointer ${notification.read ? 'opacity-70' : 'bg-primary/5'}`}
                          onClick={() => {
                            if (!notification.read) markReadMutation.mutate(notification._id);
                            // If there is a link, we would navigate here. router.push(notification.link)
                          }}
                        >
                          <div className="mt-0.5 shrink-0">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className={`text-sm ${notification.read ? 'text-muted-foreground font-medium' : 'text-foreground font-semibold'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/80 mt-2">
                              {new Date(notification.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="shrink-0 flex items-center justify-center pt-1.5">
                              <span className="h-2 w-2 rounded-full bg-primary"></span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          
        </div>

        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-muted-foreground mt-1">{user?.email}</span>
          </div>
          <Avatar 
            src={user?.avatarUrl}
            fallback={`${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`} 
          />
        </div>
      </div>
      
      {/* Search Modal */}
      <CommandPalette open={isSearchOpen} setOpen={setIsSearchOpen} />
    </header>
  );
}
