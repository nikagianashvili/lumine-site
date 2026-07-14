import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SERVICE_LABELS } from "@/lib/serviceTypes";
import type { Engagement, Task, TeamMember } from "@/lib/api";

const PRIORITY_VARIANT = { low: "success", medium: "warning", high: "destructive" } as const;

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function TaskCard({
  task,
  assignee,
  project,
  dragging,
}: {
  task: Task;
  assignee?: TeamMember;
  project?: Engagement;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      data-task-id={task.id}
      {...listeners}
      {...attributes}
      className={cn(
        "flex cursor-grab flex-col gap-2 rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-shadow active:cursor-grabbing",
        (isDragging || dragging) && "opacity-40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
        <span className="text-xs text-muted-foreground">
          {task.service_type ? SERVICE_LABELS[task.service_type] || task.service_type : "General"}
        </span>
      </div>
      <p className="text-sm font-medium leading-snug">{task.title}</p>
      {project && (
        <span className="w-fit truncate rounded-full bg-muted px-2 py-0.5 text-[0.7rem] text-muted-foreground">
          {project.title}
        </span>
      )}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">{task.due_date ? `Due ${formatDate(task.due_date)}` : ""}</span>
        {assignee && (
          <span
            title={assignee.name || undefined}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[0.65rem] font-semibold text-muted-foreground"
          >
            {initials(assignee.name)}
          </span>
        )}
      </div>
    </div>
  );
}
