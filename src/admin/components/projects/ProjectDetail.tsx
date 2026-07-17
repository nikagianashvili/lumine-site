import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Sparkles, Share2 } from "lucide-react";
import { api, type EngagementStatus } from "@/lib/api";
import { SERVICE_LABELS } from "@/lib/serviceTypes";
import { INDUSTRIES } from "@/lib/portfolioTaxonomy";
import { isMissingTableError } from "@/lib/errors";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/ui/back-button";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ProjectBoard } from "@/components/projects/ProjectBoard";
import { TaskModal } from "@/components/program/TaskModal";
import { PublishToPortfolioModal } from "@/components/projects/PublishToPortfolioModal";
import { QuotaCard } from "@/components/projects/QuotaCard";
import { FileUploadButton } from "@/components/files/FileUploadButton";
import { FileList } from "@/components/files/FileList";
import { ShareDialog, type ShareItem } from "@/components/shell/ShareDialog";

const STATUS_OPTIONS: EngagementStatus[] = ["active", "on_hold", "completed", "cancelled"];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function ProjectDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const engagementsQuery = useQuery({ queryKey: ["engagements"], queryFn: api.engagements.list });
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });
  const filesQuery = useQuery({
    queryKey: ["files", "engagement", id],
    queryFn: () => api.files.list({ engagement_id: id }),
  });

  const [notes, setNotes] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (updates: Record<string, unknown>) => api.engagements.update(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["engagements"] }),
    onError: (err: Error) => toast({ title: "Couldn't save change", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.engagements.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engagements"] });
      onBack();
    },
    onError: (err: Error) => toast({ title: "Couldn't delete project", description: err.message, variant: "destructive" }),
  });

  if (engagementsQuery.isLoading || clientsQuery.isLoading || tasksQuery.isLoading) {
    return <Skeleton className="h-96" />;
  }

  const project = engagementsQuery.data?.find((p) => p.id === id);
  if (!project) {
    return (
      <div className="flex flex-col gap-4 pt-6">
        <BackButton onClick={onBack} label="All projects" />
        <p className="text-sm text-muted-foreground">This project no longer exists.</p>
      </div>
    );
  }

  const client = clientsQuery.data?.find((c) => c.id === project.client_id);
  const projectTasks = (tasksQuery.data ?? []).filter((t) => t.engagement_id === id);
  const total = projectTasks.length;
  const done = projectTasks.filter((t) => t.status === "done").length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="flex flex-col gap-4 pt-6">
      <BackButton onClick={onBack} label="All projects" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{project.title}</h1>
          <p className="text-sm text-muted-foreground">
            {client ? client.name || client.email : "No client linked"}
            {project.service_type && ` · ${SERVICE_LABELS[project.service_type] || project.service_type}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {project.status === "completed" && (
            <Button size="sm" onClick={() => setPublishModalOpen(true)}>
              <Sparkles className="size-4" />
              Publish to Portfolio
            </Button>
          )}
          <button
            type="button"
            aria-label="Share project"
            onClick={() => setShareOpen(true)}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Share2 className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Delete project"
            onClick={() => setConfirmDeleteOpen(true)}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</span>
                <Select
                  value={project.status}
                  onValueChange={(v) => updateMutation.mutate({ status: v as EngagementStatus })}
                >
                  <SelectTrigger className="w-full">
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
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Industry</span>
                <Select
                  value={project.industry ?? "none"}
                  onValueChange={(v) => updateMutation.mutate({ industry: v === "none" ? null : v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Not set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not set</SelectItem>
                    {INDUSTRIES.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Budget</span>
                <span className="text-sm">{project.budget || "—"}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Start</span>
                <span className="text-sm">{formatDate(project.start_date)}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">End</span>
                <span className="text-sm">{formatDate(project.end_date)}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</span>
                <label className="flex h-9 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={project.is_retainer ?? false}
                    onChange={(e) => updateMutation.mutate({ is_retainer: e.target.checked })}
                    className="size-4 rounded border-border accent-primary"
                  />
                  Ongoing retainer
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</span>
              <Textarea
                value={notes ?? project.notes ?? ""}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => {
                  if (notes !== null && notes !== project.notes) updateMutation.mutate({ notes });
                }}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm text-muted-foreground">
              {total === 0 ? "No tasks linked yet" : `${done} of ${total} tasks done (${progress}%)`}
            </span>
          </CardContent>
        </Card>
      </div>

      {project.is_retainer && <QuotaCard project={project} />}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {project.service_type && SERVICE_LABELS[project.service_type]
              ? `${SERVICE_LABELS[project.service_type]} pipeline`
              : "Tasks"}
          </CardTitle>
          <Button size="sm" onClick={() => setTaskModalOpen(true)}>
            <Plus className="size-4" />
            New task
          </Button>
        </CardHeader>
        <div className="px-5 pb-5">
          <ProjectBoard project={project} tasks={projectTasks} />
        </div>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Files</CardTitle>
          <FileUploadButton category="creative" engagementId={project.id} queryKey={["files", "engagement", id]} />
        </CardHeader>
        <div className="px-5 pb-5">
          {filesQuery.isError ? (
            isMissingTableError(filesQuery.error) ? (
              <p className="py-6 text-sm text-muted-foreground">File storage isn't set up yet.</p>
            ) : (
              <ErrorState message={filesQuery.error.message} onRetry={() => filesQuery.refetch()} />
            )
          ) : (
            <FileList
              files={filesQuery.data ?? []}
              queryKey={["files", "engagement", id]}
              emptyLabel="No files yet — upload the first one."
              isLoading={filesQuery.isLoading}
            />
          )}
        </div>
      </Card>

      <TaskModal open={taskModalOpen} onOpenChange={setTaskModalOpen} defaultEngagementId={project.id} />
      {publishModalOpen && (
        <PublishToPortfolioModal
          open={publishModalOpen}
          onOpenChange={setPublishModalOpen}
          project={project}
          client={client}
        />
      )}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete this project?"
        description="Its tasks will stay but lose the project link. This can't be undone."
        confirmLabel="Delete project"
        pending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        item={{ kind: "project", name: project.title, engagementId: project.id } satisfies ShareItem}
      />
    </div>
  );
}
