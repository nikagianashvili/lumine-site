import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type TaskPriority, type TaskStatus } from "@/lib/api";
import { pipelineFor } from "@/lib/pipelines";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TaskModal({
  open,
  onOpenChange,
  defaultStatus,
  defaultEngagementId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: TaskStatus;
  defaultEngagementId?: string;
}) {
  const queryClient = useQueryClient();
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  const engagementsQuery = useQuery({ queryKey: ["engagements"], queryFn: api.engagements.list });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [engagementId, setEngagementId] = useState<string>(defaultEngagementId ?? "");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: api.tasks.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      reset();
      onOpenChange(false);
    },
    onError: (err: Error) => setError(err.message),
  });

  function reset() {
    setTitle("");
    setDescription("");
    setEngagementId(defaultEngagementId ?? "");
    setPriority("medium");
    setDueDate("");
    setAssignee("");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!engagementId) {
      setError("Pick which project this belongs to");
      return;
    }
    setError(null);
    const project = (engagementsQuery.data ?? []).find((p) => p.id === engagementId);
    const pipeline = pipelineFor(project?.service_type);
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      // A task always starts at its pipeline's first stage (todo by
      // definition) when the project has one - defaultStatus only applies
      // to projects with no defined pipeline (dropped onto the generic
      // board's status columns instead).
      status: pipeline ? pipeline[0].status : defaultStatus || "todo",
      stage: pipeline ? pipeline[0].stage : null,
      engagement_id: engagementId,
      // denormalized from the project so Board/Spreadsheet can filter by
      // category without a join - stays in sync because it's only ever set
      // here, from the project's own service_type, never edited independently
      service_type: project?.service_type || null,
      priority,
      due_date: dueDate || null,
      assignee: assignee || null,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Add a task to the board.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Project</Label>
            <Select value={engagementId} onValueChange={setEngagementId}>
              <SelectTrigger>
                <SelectValue placeholder={(engagementsQuery.data ?? []).length === 0 ? "No projects yet" : "Choose a project"} />
              </SelectTrigger>
              <SelectContent>
                {(engagementsQuery.data ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(engagementsQuery.data ?? []).length === 0 && !engagementsQuery.isLoading && (
              <p className="text-xs text-muted-foreground">Create a project first, from the Projects tab.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {(teamQuery.data ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name || "Unnamed"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Adding…" : "Add task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
