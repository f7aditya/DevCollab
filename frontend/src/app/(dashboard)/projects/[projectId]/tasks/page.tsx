// @ts-nocheck
"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, createTask, updateTask, reorderTasks, deleteTask, Task, TaskStatus } from "@/features/tasks/api/tasksApi";
import { getMembers } from "@/features/members/api/membersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Plus, MoreHorizontal, Calendar, GripVertical, AlertCircle, Search, Github } from "lucide-react";
import { GithubActivityBadge } from "@/features/github/components/GithubActivityBadge";
import { useTaskLinks } from "@/features/github/hooks/useGithubActivity";

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-surface-hover text-muted-foreground",
  MEDIUM: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  URGENT: "bg-danger/10 text-danger border-danger/20",
};

export default function KanbanBoardPage({ params }: { params: { projectId: string } }) {
  const { projectId } = React.use(params) as any;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [formData, setFormData] = useState({ title: "", description: "", priority: "MEDIUM" as any });

  const { data: serverTasks, isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => getTasks(projectId),
  });

  const { data: taskLinks = [] } = useTaskLinks(selectedTask?._id);

  const { data: members = [] } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => getMembers(projectId),
  });

  // Local state for optimistic drag and drop
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  // Sync local tasks when server tasks change (unless we are dragging)
  useEffect(() => {
    if (!draggedTask && serverTasks) {
      setLocalTasks([...serverTasks].sort((a, b) => a.order - b.order));
    }
  }, [serverTasks, draggedTask]);

  const createMutation = useMutation({
    mutationFn: (data: any) => createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setIsCreateOpen(false);
      setFormData({ title: "", description: "", priority: "MEDIUM" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string, data: any }) => updateTask(projectId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    }
  });

  const reorderMutation = useMutation({
    mutationFn: (tasks: any[]) => reorderTasks(projectId, tasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setIsDetailOpen(false);
    }
  });

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    // For visual ghost
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = "0.4";
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTask(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    // Optimistic local update
    const updatedTasks = [...localTasks];
    const taskIndex = updatedTasks.findIndex(t => t._id === draggedTask._id);
    if (taskIndex === -1) return;

    // Remove task from old position
    const [movedTask] = updatedTasks.splice(taskIndex, 1);
    
    // Update status
    movedTask.status = targetStatus;

    // Figure out where to drop it (append to end of column for simplicity in this native implementation)
    // We could calculate Y offset to drop between tasks, but appending is safest for basic native DND.
    updatedTasks.push(movedTask);

    // Re-calculate orders for the affected column
    const columnTasks = updatedTasks.filter(t => t.status === targetStatus);
    const reorderedPayload = columnTasks.map((t, index) => ({
      id: t._id,
      status: targetStatus,
      order: index
    }));

    setLocalTasks(updatedTasks);
    reorderMutation.mutate(reorderedPayload);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...formData, status: "TODO", order: localTasks.filter(t => t.status === "TODO").length });
  };

  const filteredTasks = localTasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const getAssignee = (id?: string) => {
    const member = members.find(m => m.user._id === id);
    return member ? member.user : null;
  };

  if (isLoading) {
    return (
      <div className="flex h-full gap-6 p-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 min-w-[300px] bg-surface rounded-xl p-4 space-y-4 border border-border">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-9 w-full bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full items-start gap-6">
          {COLUMNS.map((column) => {
            const columnTasks = filteredTasks.filter(t => t.status === column.id);

            return (
              <div 
                key={column.id} 
                className="flex-shrink-0 w-[340px] flex flex-col max-h-full bg-surface/50 border border-border rounded-xl"
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="p-4 flex items-center justify-between border-b border-border/50">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    {column.title}
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{columnTasks.length}</Badge>
                  </h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px]">
                  
                    {columnTasks.map((task) => (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        onClick={() => { setSelectedTask(task); setIsDetailOpen(true); }}
                        className="group bg-background p-4 rounded-lg border border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${PRIORITY_COLORS[task.priority]}`}>
                            {task.priority}
                          </span>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                        <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-1">{task.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{task.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-[11px] bg-surface px-1.5 py-0.5 rounded">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </div>
                            )}
                          </div>
                          {task.assigneeId ? (
                            <Avatar 
                              className="h-6 w-6 border-background border-2" 
                              fallback={`${getAssignee(task.assigneeId)?.firstName[0] || "U"}`} 
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-surface">
                              <span className="text-[10px] text-muted-foreground">?</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  
                  
                  {columnTasks.length === 0 && (
                    <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg text-sm text-muted-foreground">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Add a new task to your Kanban board.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input 
              required 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task details..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select 
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose onClick={() => setIsCreateOpen(false)} />
      </Dialog>

      {/* TASK DETAIL DRAWER (Implemented as a large Dialog for now) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {selectedTask && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${PRIORITY_COLORS[selectedTask.priority]}`}>
                  {selectedTask.priority}
                </span>
                <Badge variant="outline">{selectedTask.status.replace("_", " ")}</Badge>
              </div>
              <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                <div className="p-4 bg-surface rounded-lg border border-border text-sm leading-relaxed min-h-[100px]">
                  {selectedTask.description || "No description provided."}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Assignee</h4>
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    {selectedTask.assigneeId ? (
                      <>
                        <Avatar fallback={`${getAssignee(selectedTask.assigneeId)?.firstName[0] || "U"}`} />
                        <span className="text-sm font-medium">
                          {getAssignee(selectedTask.assigneeId)?.firstName} {getAssignee(selectedTask.assigneeId)?.lastName}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Unassigned</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Dates</h4>
                  <div className="flex flex-col gap-1 p-3 border border-border rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(selectedTask.createdAt).toLocaleDateString()}</span>
                    </div>
                    {selectedTask.dueDate && (
                      <div className="flex items-center justify-between text-danger">
                        <span>Due</span>
                        <span>{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {taskLinks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Github className="h-4 w-4" /> GitHub Activity
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {taskLinks.map((link: any) => (
                      <a 
                        key={link._id} 
                        href={link.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="hover:opacity-80 transition-opacity"
                      >
                        <GithubActivityBadge 
                          type={link.githubType} 
                          status={link.status} 
                          number={link.githubNumber} 
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="mt-8 pt-4 border-t border-border flex justify-between sm:justify-between items-center w-full">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => deleteMutation.mutate(selectedTask._id)}
                disabled={deleteMutation.isPending}
              >
                Delete Task
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
              </div>
            </DialogFooter>
            <DialogClose onClick={() => setIsDetailOpen(false)} />
          </>
        )}
      </Dialog>
    </div>
  );
}
