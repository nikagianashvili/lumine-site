import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { api, type EngagementStatus } from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadButton } from "@/components/files/FileUploadButton";
import { FileList } from "@/components/files/FileList";

const ENGAGEMENT_STATUS_VARIANT: Record<EngagementStatus, "info" | "success" | "secondary" | "destructive"> = {
  active: "info",
  completed: "success",
  on_hold: "secondary",
  cancelled: "destructive",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function ClientDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const engagementsQuery = useQuery({ queryKey: ["engagements"], queryFn: api.engagements.list });
  const convosQuery = useQuery({ queryKey: ["conversations"], queryFn: api.conversations.list });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });
  const filesQuery = useQuery({
    queryKey: ["files", "client", id],
    queryFn: () => api.files.list({ category: "document", client_id: id }),
  });

  if (clientsQuery.isLoading) return <Skeleton className="h-96" />;

  const client = clientsQuery.data?.find((c) => c.id === id);
  if (!client) {
    return (
      <div className="flex flex-col gap-4 pt-6">
        <BackButton onBack={onBack} />
        <p className="text-sm text-muted-foreground">This client no longer exists.</p>
      </div>
    );
  }

  const projects = (engagementsQuery.data ?? []).filter((p) => p.client_id === id);
  const conversations = (convosQuery.data ?? []).filter((c) => c.client_id === id);
  const tasks = tasksQuery.data ?? [];
  const projectIds = new Set(projects.map((p) => p.id));

  return (
    <div className="flex flex-col gap-4 pt-6">
      <BackButton onBack={onBack} />

      <div>
        <h1 className="font-display text-2xl font-bold">{client.name || client.email || "Unnamed"}</h1>
        <p className="text-sm text-muted-foreground">
          {[client.company, client.email, client.phone].filter(Boolean).join(" · ") || "No contact details on file"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-1 px-5 pb-5">
          {projects.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No projects for this client yet.</p>
          ) : (
            projects.map((p) => {
              const projectTasks = tasks.filter((t) => t.engagement_id === p.id);
              const done = projectTasks.filter((t) => t.status === "done").length;
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
                  <span className="flex-1 truncate">{p.title}</span>
                  <Badge variant={ENGAGEMENT_STATUS_VARIANT[p.status]}>{p.status.replace("_", " ")}</Badge>
                  <span className="w-24 text-right text-xs text-muted-foreground">
                    {projectTasks.length === 0 ? "—" : `${done}/${projectTasks.length} done`}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI conversations</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-1 px-5 pb-5">
          {conversations.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No AI conversations linked to this client.</p>
          ) : (
            conversations.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
                <span className="flex-1 truncate">{c.summary || `${c.transcript.length} messages`}</span>
                {c.status === "qualified" && <Badge variant="destructive">escalated</Badge>}
                <span className="flex-shrink-0 text-xs text-muted-foreground">{formatDate(c.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documents</CardTitle>
          <FileUploadButton category="document" clientId={id} queryKey={["files", "client", id]} />
        </CardHeader>
        <div className="px-5 pb-5">
          {filesQuery.isError ? (
            <p className="text-sm text-muted-foreground">Document storage isn't set up yet.</p>
          ) : (
            <FileList
              files={filesQuery.data ?? []}
              queryKey={["files", "client", id]}
              emptyLabel="No invoices or contracts on file yet."
              isLoading={filesQuery.isLoading}
            />
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5">
          <p className="text-sm text-muted-foreground">{client.notes || "No notes yet."}</p>
        </div>
      </Card>

      {tasks.some((t) => t.engagement_id && projectIds.has(t.engagement_id)) && (
        <Card>
          <CardHeader>
            <CardTitle>Tasks across their projects</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-1 px-5 pb-5">
            {tasks
              .filter((t) => t.engagement_id && projectIds.has(t.engagement_id))
              .slice(0, 8)
              .map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
                  <span className="flex-1 truncate">{t.title}</span>
                  <span className="text-xs text-muted-foreground">{t.status.replace("_", " ")}</span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" />
      All clients
    </button>
  );
}
