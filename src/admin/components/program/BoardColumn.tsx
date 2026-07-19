import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { TASK_STATUS_LABELS } from "@/lib/taskMeta";
import { TaskCard } from "@/components/program/TaskCard";
import type { Engagement, Task, TaskStatus, TeamMember } from "@/lib/api";

export function BoardColumn({
  status,
  tasks,
  teamMembers,
  engagements,
  activeId,
}: {
  status: TaskStatus;
  tasks: Task[];
  teamMembers: TeamMember[];
  engagements: Engagement[];
  activeId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      data-status={status}
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-2xl border border-transparent bg-muted/60 p-3 transition-colors",
        isOver && "border-primary/40 bg-accent",
      )}
    >
      <div className="flex items-center gap-2 px-1">
        <span className="text-sm font-medium">{TASK_STATUS_LABELS[status]}</span>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-xs font-semibold text-background">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            assignee={teamMembers.find((m) => m.id === t.assignee)}
            project={engagements.find((p) => p.id === t.engagement_id)}
            dragging={activeId === t.id}
          />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}
