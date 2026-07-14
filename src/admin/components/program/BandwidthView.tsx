import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { HATS } from "@/lib/hats";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Open tasks per hat (Phase 7) - a task with no hat_tags shows up nowhere
// here, which is itself useful signal (untagged work isn't tracked by
// skill). A task with two hats counts toward both - hats aren't exclusive.
export function BandwidthView() {
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });

  const byHat = useMemo(() => {
    const open = (tasksQuery.data ?? []).filter((t) => t.status !== "done");
    return HATS.map((hat) => ({
      hat,
      tasks: open.filter((t) => t.hat_tags?.includes(hat)),
    }));
  }, [tasksQuery.data]);

  const teamByHat = useMemo(() => {
    const team = teamQuery.data ?? [];
    return HATS.map((hat) => ({
      hat,
      people: team.filter((m) => m.skills_tags?.includes(hat)),
    }));
  }, [teamQuery.data]);

  if (tasksQuery.isLoading || teamQuery.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {byHat.map(({ hat, tasks }) => {
        const people = teamByHat.find((t) => t.hat === hat)?.people ?? [];
        return (
          <Card key={hat}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">{hat}</CardTitle>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-foreground px-1.5 text-xs font-semibold text-background">
                {tasks.length}
              </span>
            </CardHeader>
            <div className="flex flex-col gap-1 px-5 pb-5">
              <p className="text-xs text-muted-foreground">
                {people.length === 0 ? "No one has this hat yet" : people.map((p) => p.name).join(", ")}
              </p>
              {tasks.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">No open tasks</p>
              ) : (
                tasks.slice(0, 5).map((t) => (
                  <div key={t.id} className="truncate rounded-lg px-1 py-1.5 text-sm">
                    {t.title}
                  </div>
                ))
              )}
              {tasks.length > 5 && (
                <p className="px-1 text-xs text-muted-foreground">+{tasks.length - 5} more</p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
