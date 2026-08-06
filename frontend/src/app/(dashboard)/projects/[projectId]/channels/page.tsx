// @ts-nocheck
"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChannels, createChannel, getMessages, sendMessage, Channel, Message } from "@/features/chat/api/chatApi";
import { getMembers } from "@/features/members/api/membersApi";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Hash, Plus, Send, MessageSquare } from "lucide-react";

export default function ChannelsPage({ params }: { params: { projectId: string } }) {
  const { projectId } = React.use(params) as any;
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newChannelData, setNewChannelData] = useState({ name: "", description: "" });

  // Fetch Channels
  const { data: channels = [], isLoading: isLoadingChannels } = useQuery({
    queryKey: ["channels", projectId],
    queryFn: () => getChannels(projectId),
  });

  // Fetch Members (for avatars)
  const { data: members = [] } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => getMembers(projectId),
  });

  // Fetch Messages for active channel
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", projectId, activeChannelId],
    queryFn: () => activeChannelId ? getMessages(projectId, activeChannelId) : Promise.resolve([]),
    enabled: !!activeChannelId,
    refetchInterval: 5000, // Basic polling for real-time feel since Socket.IO isn't set up yet
  });

  // Set default active channel
  useEffect(() => {
    if (channels.length > 0 && !activeChannelId) {
      setActiveChannelId(channels[0]._id);
    }
  }, [channels, activeChannelId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentUserRole = members.find((m) => m.user._id === user?._id)?.role;
  const canCreateChannel = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const createChannelMutation = useMutation({
    mutationFn: (data: any) => createChannel(projectId, data),
    onSuccess: (newChannel) => {
      queryClient.invalidateQueries({ queryKey: ["channels", projectId] });
      setIsCreateOpen(false);
      setNewChannelData({ name: "", description: "" });
      setActiveChannelId(newChannel._id);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => sendMessage(projectId, activeChannelId!, content),
    onMutate: async (newContent) => {
      if (!activeChannelId || !user) return;
      await queryClient.cancelQueries({ queryKey: ["messages", projectId, activeChannelId] });
      const previousMessages = queryClient.getQueryData<Message[]>(["messages", projectId, activeChannelId]);
      
      const optimisticMessage: Message = {
        _id: `temp-${Date.now()}`,
        channelId: activeChannelId,
        senderId: user._id,
        content: newContent,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(["messages", projectId, activeChannelId], (old) => {
        return [...(old || []), optimisticMessage];
      });
      return { previousMessages };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["messages", projectId, activeChannelId], context?.previousMessages);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", projectId, activeChannelId] });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChannelId) return;
    sendMessageMutation.mutate(messageInput);
    setMessageInput("");
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    createChannelMutation.mutate(newChannelData);
  };

  const getSender = (senderData: any) => {
    // If backend populated senderId, it's an object
    if (typeof senderData === 'object' && senderData !== null && senderData._id) {
      return senderData;
    }
    // If it's just a string (like from optimistic updates)
    const member = members.find(m => m.user._id === senderData);
    return member?.user || { firstName: "Unknown", lastName: "User", _id: senderData };
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex border border-border rounded-xl overflow-hidden bg-background shadow-sm">
      
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-surface flex flex-col hidden md:flex">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm">Channels</h3>
          {canCreateChannel && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoadingChannels ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))
          ) : (
            channels.map((channel) => (
              <button
                key={channel._id}
                onClick={() => setActiveChannelId(channel._id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeChannelId === channel._id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <Hash className="h-4 w-4 shrink-0" />
                <span className="truncate">{channel.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {activeChannelId ? (
          <>
            {/* Chat Header */}
            <div className="h-14 border-b border-border flex items-center px-6">
              <Hash className="h-5 w-5 text-muted-foreground mr-2" />
              <h2 className="font-semibold">
                {channels.find(c => c._id === activeChannelId)?.name}
              </h2>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingMessages ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 opacity-20 mb-4" />
                  <p>No messages yet. Be the first to say hello!</p>
                </div>
              ) : (
                <>
                  {[...messages].reverse().map((message) => {
                    const sender = getSender(message.senderId);
                    const isCurrentUser = sender._id === user?._id;

                    return (
                      <div
                        key={message._id}
                        className="flex gap-4"
                      >
                        <Avatar fallback={`${sender.firstName[0] || 'U'}${sender.lastName[0] || 'U'}`} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {sender.firstName} {sender.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-sm text-foreground bg-surface/50 p-3 rounded-xl rounded-tl-none border border-border inline-block max-w-[80%] leading-relaxed">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-surface border-t border-border">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <Input 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message #${channels.find(c => c._id === activeChannelId)?.name || "channel"}...`}
                  className="flex-1 bg-background"
                />
                <Button type="submit" disabled={!messageInput.trim() || sendMessageMutation.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Hash className="h-12 w-12 opacity-20 mb-4" />
            <p>Select a channel or create a new one to start messaging.</p>
          </div>
        )}
      </div>

      {/* CREATE CHANNEL MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>Create a new channel for discussion.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateChannel} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Channel Name</label>
            <Input 
              required 
              value={newChannelData.name}
              onChange={(e) => setNewChannelData({ ...newChannelData, name: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              placeholder="e.g. general"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input 
              value={newChannelData.description}
              onChange={(e) => setNewChannelData({ ...newChannelData, description: e.target.value })}
              placeholder="What is this channel about?"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createChannelMutation.isPending}>
              {createChannelMutation.isPending ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose onClick={() => setIsCreateOpen(false)} />
      </Dialog>
    </div>
  );
}
