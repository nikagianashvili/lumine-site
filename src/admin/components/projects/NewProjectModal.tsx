import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Client, type EngagementStatus } from "@/lib/api";
import { SERVICE_TYPES } from "@/lib/serviceTypes";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_OPTIONS: EngagementStatus[] = ["active", "on_hold", "completed", "cancelled"];

export function NewProjectModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [status, setStatus] = useState<EngagementStatus>("active");
  const [serviceType, setServiceType] = useState<string>("");
  const [budget, setBudget] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.engagements.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engagements"] });
      reset();
      onOpenChange(false);
    },
    onError: (err: Error) => setError(err.message),
  });

  function reset() {
    setTitle("");
    setClientId("");
    setStatus("active");
    setServiceType("");
    setBudget("");
    setCoverImageUrl("");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the project a name");
      return;
    }
    if (!clientId) {
      setError("Pick which client this is for");
      return;
    }
    setError(null);
    mutation.mutate({
      title: title.trim(),
      client_id: clientId,
      status,
      service_type: serviceType || null,
      budget: budget.trim() || null,
      cover_image_url: coverImageUrl.trim() || null,
    });
  }

  const clients = clientsQuery.data ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent open={open}>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Real, paid work for a client — separate from the public portfolio.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-title">Project name</Label>
            <Input id="project-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: Client) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name || c.email || "Unnamed"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Service</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="General" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as EngagementStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project-budget">Budget</Label>
              <Input id="project-budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. $4,500" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-cover">Cover image URL (optional)</Label>
            <Input
              id="project-cover"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
