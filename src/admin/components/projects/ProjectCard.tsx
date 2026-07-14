import { ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SERVICE_LABELS } from "@/lib/serviceTypes";
import type { Engagement, EngagementStatus, Task } from "@/lib/api";

const STATUS_VARIANT: Record<EngagementStatus, "info" | "success" | "secondary" | "destructive"> = {
  active: "info",
  completed: "success",
  on_hold: "secondary",
  cancelled: "destructive",
};

const STATUS_LABEL: Record<EngagementStatus, string> = {
  active: "Active",
  completed: "Completed",
  on_hold: "On hold",
  cancelled: "Cancelled",
};

export function ProjectCard({
  project,
  clientName,
  tasks,
  onClick,
}: {
  project: Engagement;
  clientName: string;
  tasks: Task[];
  onClick: () => void;
}) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-28 items-center justify-center bg-muted">
        {project.cover_image_url ? (
          <img src={project.cover_image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium leading-snug">{project.title}</p>
          <Badge variant={STATUS_VARIANT[project.status]}>{STATUS_LABEL[project.status]}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{clientName}</p>
        {project.service_type && (
          <span className="w-fit rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
            {SERVICE_LABELS[project.service_type] || project.service_type}
          </span>
        )}
        <div className="mt-auto flex flex-col gap-1 pt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">
            {total === 0 ? "No tasks yet" : `${done}/${total} tasks done`}
          </span>
        </div>
      </div>
    </button>
  );
}
