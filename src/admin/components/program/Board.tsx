import { useState } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Rows3 } from "lucide-react";
import { api, type Task, type TaskStatus } from "@/lib/api";
import { BoardColumn } from "@/components/program/BoardColumn";
import { TaskCard } from "@/components/program/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "done"];

export function Board({ onCreateTask }: { onCreateTask?: () => void }) {
  const toast = useToast();
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
    onError: (err: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["tasks"], context.previous);
      toast({ title: "Couldn't move task", description: err.message, variant: "destructive" });
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
    // mirrors the loaded board's responsive grid so nothing jumps on load
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {STATUSES.map((s) => (
          <Skeleton key={s} className="h-64 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (tasksQuery.isError) {
    return <ErrorState message={tasksQuery.error.message} onRetry={() => tasksQuery.refetch()} />;
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
        <EmptyState
          icon={Rows3}
          title="No tasks yet"
          description="Everything the team is working on lands here, organized by status."
          action={
            onCreateTask && (
              <Button size="sm" onClick={onCreateTask}>
                <Plus className="size-4" />
                Create the first task
              </Button>
            )
          }
        />
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
