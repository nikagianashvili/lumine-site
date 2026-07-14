import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Engagement, type Task, type TaskStatus, type TeamMember } from "@/lib/api";
import { pipelineFor } from "@/lib/pipelines";
import { TaskCard } from "@/components/program/TaskCard";
import { cn } from "@/lib/utils";

const GENERIC_STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "done"];
const GENERIC_LABELS: Record<TaskStatus, string> = {
  todo: "Not Started",
  in_progress: "In Progress",
  review: "Under Review",
  done: "Completed",
};

// A project with a recognized service_type gets its real pipeline (see
// lib/pipelines.ts); anything else (no service chosen, or one without a
// defined pipeline yet) falls back to the same generic 4-status columns
// the cross-project Program board uses - never a project with no board.
export function ProjectBoard({ project, tasks }: { project: Engagement; tasks: Task[] }) {
  const queryClient = useQueryClient();
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const pipeline = pipelineFor(project.service_type);
  const columns: { id: string; label: string }[] = pipeline
    ? pipeline.map((s) => ({ id: s.stage, label: s.stage }))
    : GENERIC_STATUSES.map((s) => ({ id: s, label: GENERIC_LABELS[s] }));

  const moveMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) => api.tasks.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, ...updates } : t)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;
    const columnId = over.id as string;
    if (pipeline) {
      const currentStage = task.stage || pipeline[0].stage;
      if (currentStage === columnId) return;
      const status = pipeline.find((s) => s.stage === columnId)?.status ?? task.status;
      moveMutation.mutate({ id: task.id, updates: { stage: columnId, status } });
    } else {
      if (task.status === columnId) return;
      moveMutation.mutate({ id: task.id, updates: { status: columnId as TaskStatus } });
    }
  }

  function tasksFor(columnId: string) {
    if (pipeline) return tasks.filter((t) => (t.stage || pipeline[0].stage) === columnId);
    return tasks.filter((t) => t.status === columnId);
  }

  const teamMembers = teamQuery.data ?? [];
  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((col) => (
          <ProjectBoardColumn
            key={col.id}
            id={col.id}
            label={col.label}
            tasks={tasksFor(col.id)}
            teamMembers={teamMembers}
            activeId={activeId}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} assignee={teamMembers.find((m) => m.id === activeTask.assignee)} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function ProjectBoardColumn({
  id,
  label,
  tasks,
  teamMembers,
  activeId,
}: {
  id: string;
  label: string;
  tasks: Task[];
  teamMembers: TeamMember[];
  activeId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      data-stage={id}
      className={cn(
        "flex w-64 flex-shrink-0 flex-col gap-3 rounded-2xl border border-transparent bg-muted/60 p-3 transition-colors",
        isOver && "border-primary/40 bg-accent",
      )}
    >
      <div className="flex items-center gap-2 px-1">
        <span className="truncate text-sm font-medium">{label}</span>
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
