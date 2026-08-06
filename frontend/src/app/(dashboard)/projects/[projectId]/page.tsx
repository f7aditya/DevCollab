// @ts-nocheck
"use client";

import React from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPosts, createPost, deletePost, getComments, createComment, deleteComment, Post, PostComment } from "@/features/posts/api/postsApi";
import { getMembers } from "@/features/members/api/membersApi";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MessageSquare, MoreHorizontal, FileText, Trash2 } from "lucide-react";

export default function ProjectOverviewPage({ params }: { params: { projectId: string } }) {
  const { projectId } = React.use(params) as any;
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", tags: "" });
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ["posts", projectId],
    queryFn: () => getPosts(projectId),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => getMembers(projectId),
  });

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["postComments", projectId, selectedPost?._id],
    queryFn: () => selectedPost ? getComments(projectId, selectedPost._id) : Promise.resolve([]),
    enabled: !!selectedPost,
  });

  const createPostMutation = useMutation({
    mutationFn: (data: any) => createPost(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", projectId] });
      setIsCreateOpen(false);
      setFormData({ title: "", content: "", tags: "" });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => deletePost(projectId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", projectId] });
      setIsDetailOpen(false);
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createComment(projectId, selectedPost!._id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postComments", projectId, selectedPost?._id] });
      setCommentInput("");
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(projectId, selectedPost!._id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postComments", projectId, selectedPost?._id] });
    }
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(Boolean);
    createPostMutation.mutate({ ...formData, tags: tagsArray });
  };

  const getAuthor = (authorInfo: any) => {
    if (typeof authorInfo === 'object' && authorInfo !== null) {
      return {
        _id: authorInfo._id,
        firstName: authorInfo.firstName || "Unknown",
        lastName: authorInfo.lastName || "User",
        avatarUrl: authorInfo.avatarUrl
      };
    }
    const member = members.find(m => m.user._id === authorInfo);
    return member?.user || { firstName: "Unknown", lastName: "User", _id: authorInfo };
  };

  const currentUserRole = members.find((m) => m.user._id === user?._id)?.role;
  const canDelete = (authorInfo: any) => {
    const id = typeof authorInfo === 'object' && authorInfo !== null ? authorInfo._id : authorInfo;
    return currentUserRole === "OWNER" || currentUserRole === "ADMIN" || id === user?._id;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Feed</h2>
          <p className="text-muted-foreground mt-1">Share updates, ideas, and announcements with your team.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="shrink-0 shadow-sm">
          New Post
        </Button>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {isLoadingPosts ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 bg-background rounded-xl border border-border space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center bg-background border border-border rounded-xl border-dashed">
            <FileText className="h-12 w-12 opacity-20 mb-4" />
            <p>No posts yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => {
              const author = getAuthor(post.authorId);
              return (
                <div
                  key={post._id}
                  className="p-6 bg-background rounded-xl border border-border shadow-sm hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => { setSelectedPost(post); setIsDetailOpen(true); }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar fallback={`${author.firstName[0]}${author.lastName[0]}`} />
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {author.firstName} {author.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-4">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <div className="flex gap-2">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs font-normal bg-surface hover:bg-surface">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                      <MessageSquare className="h-4 w-4" />
                      Discuss
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* CREATE POST MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>Share a long-form update with the project members.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreatePost} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input 
              required 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Q3 Roadmap Planning"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea 
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your post here..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <Input 
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g. announcement, planning"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createPostMutation.isPending}>
              {createPostMutation.isPending ? "Posting..." : "Publish Post"}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose onClick={() => setIsCreateOpen(false)} />
      </Dialog>

      {/* POST DETAIL & COMMENTS DRAWER/MODAL */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {selectedPost && (
          <>
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar fallback={`${getAuthor(selectedPost.authorId).firstName[0]}${getAuthor(selectedPost.authorId).lastName[0]}`} />
                  <div className="text-left">
                    <p className="font-medium text-sm text-foreground">
                      {getAuthor(selectedPost.authorId).firstName} {getAuthor(selectedPost.authorId).lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(selectedPost.createdAt).toLocaleString(undefined, { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {canDelete(selectedPost.authorId) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-danger hover:bg-danger/10 h-8 w-8 p-0"
                    onClick={() => deletePostMutation.mutate(selectedPost._id)}
                    disabled={deletePostMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </DialogHeader>
            <div className="mt-4 pb-6 border-b border-border max-h-[40vh] overflow-y-auto pr-2">
              <h2 className="text-2xl font-bold mb-4">{selectedPost.title}</h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {selectedPost.content}
              </div>
              {selectedPost.tags.length > 0 && (
                <div className="flex gap-2 mt-6">
                  {selectedPost.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-surface">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-6 flex flex-col h-full max-h-[30vh]">
              <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Discussion
              </h4>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {isLoadingComments ? (
                  <Skeleton className="h-16 w-full" />
                ) : comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No comments yet.</p>
                ) : (
                  comments.map((comment) => {
                    const cAuthor = getAuthor(comment.authorId);
                    return (
                      <div key={comment._id} className="flex gap-3 bg-surface/50 p-3 rounded-lg border border-border/50">
                        <Avatar className="h-8 w-8 shrink-0" fallback={`${cAuthor.firstName[0]}${cAuthor.lastName[0]}`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-medium text-xs">{cAuthor.firstName} {cAuthor.lastName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {canDelete(comment.authorId) && (
                                <button 
                                  onClick={() => deleteCommentMutation.mutate(comment._id)}
                                  className="text-muted-foreground hover:text-danger"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); if(commentInput.trim()) createCommentMutation.mutate(commentInput); }}
                className="flex items-start gap-3 mt-auto"
              >
                <Avatar className="h-8 w-8 shrink-0" fallback={user?.firstName[0]} />
                <div className="flex-1 relative">
                  <Textarea 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Leave a comment..."
                    className="min-h-[80px] bg-background text-sm resize-none pb-12"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if(commentInput.trim()) createCommentMutation.mutate(commentInput);
                      }
                    }}
                  />
                  <div className="absolute bottom-2 right-2">
                    <Button type="submit" size="sm" disabled={!commentInput.trim() || createCommentMutation.isPending}>
                      Reply
                    </Button>
                  </div>
                </div>
              </form>
            </div>
            <DialogClose onClick={() => setIsDetailOpen(false)} />
          </>
        )}
      </Dialog>
    </div>
  );
}
