import { useState } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Task, type TaskStatus } from "@/lib/api";
import { BoardColumn } from "@/components/program/BoardColumn";
import { TaskCard } from "@/components/program/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "done"];

export function Board() {
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  const engagementsQuery = useQuery({ queryKey: ["engagements"], queryFn: api.engagements.list });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const moveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => api.tasks.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, status } : t)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["tasks"], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const task = tasksQuery.data?.find((t) => t.id === active.id);
    const newStatus = over.id as TaskStatus;
    if (!task || task.status === newStatus) return;
    moveMutation.mutate({ id: task.id, status: newStatus });
  }

  if (tasksQuery.isLoading || teamQuery.isLoading || engagementsQuery.isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {STATUSES.map((s) => (
          <Skeleton key={s} className="h-64" />
        ))}
      </div>
    );
  }

  if (tasksQuery.isError) {
    return <p className="text-sm text-destructive">Couldn't load tasks: {tasksQuery.error.message}</p>;
  }

  const tasks = tasksQuery.data ?? [];
  const teamMembers = teamQuery.data ?? [];
  const engagements = engagementsQuery.data ?? [];
  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      {tasks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No tasks yet — create the first one.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)}
              teamMembers={teamMembers}
              engagements={engagements}
              activeId={activeId}
            />
          ))}
        </div>
      )}
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            assignee={teamMembers.find((m) => m.id === activeTask.assignee)}
            project={engagements.find((p) => p.id === activeTask.engagement_id)}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
