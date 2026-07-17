import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { api, type Task, type TaskPriority, type Client } from "@/lib/api";
import { PRIORITY_VARIANT, TASK_STATUS_LABELS } from "@/lib/taskMeta";
import { timeAgo } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PRIORITY_DOT: Record<TaskPriority, string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-success",
};

const PRIORITY_FILTERS = [
  { value: "all", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;
type PriorityFilter = (typeof PRIORITY_FILTERS)[number]["value"];

function dayKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function CalendarView() {
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const [cursor, setCursor] = useState(() => new Date());
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const filteredTasks = useMemo(
    () => (tasksQuery.data ?? []).filter((t) => priorityFilter === "all" || t.priority === priorityFilter),
    [tasksQuery.data, priorityFilter],
  );

  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of filteredTasks) {
      if (!t.due_date) continue;
      const key = t.due_date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    }
    return map;
  }, [filteredTasks]);

  // "activity" on a day = new leads that came in that day, alongside its due
  // tasks - so clicking a day answers "what happened / what's due", not just
  // the latter.
  const clientsByDate = useMemo(() => {
    const map = new Map<string, Client[]>();
    for (const c of clientsQuery.data ?? []) {
      const key = c.created_at.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    return map;
  }, [clientsQuery.data]);

  if (tasksQuery.isLoading) return <Skeleton className="h-[32rem] rounded-2xl" />;
  if (tasksQuery.isError) {
    return <ErrorState message={tasksQuery.error.message} onRetry={() => tasksQuery.refetch()} />;
  }

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells: { day: number | null }[] = [
    ...Array.from({ length: startOffset }, () => ({ day: null })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1 })),
  ];

  // agenda data for the phone-width fallback: this month's due days in order
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const agenda = [...byDate.entries()]
    .filter(([key]) => key.startsWith(monthPrefix))
    .sort(([a], [b]) => a.localeCompare(b));

  const selectedTasks = selectedDay ? (byDate.get(selectedDay) ?? []) : [];
  const selectedClients = selectedDay ? (clientsByDate.get(selectedDay) ?? []) : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => setCursor(new Date(year, month - 1, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-40 text-center font-display text-lg font-medium">
            {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </span>
          <Button variant="outline" size="icon" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))}>
            <ChevronRight className="size-4" />
          </Button>
          {!isCurrentMonth && (
            <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
              Today
            </Button>
          )}
        </div>
        <SegmentedControl options={PRIORITY_FILTERS} value={priorityFilter} onChange={setPriorityFilter} />
      </div>

      {/* month grid — at phone width the 7 columns truncate chips to
          nothing, so it swaps for the agenda list below */}
      <div className="hidden grid-cols-7 gap-2 sm:grid">
        {DOW.map((d) => (
          <div key={d} className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (cell.day === null) return <div key={i} className="min-h-24 rounded-xl" />;
          const key = dayKey(year, month, cell.day);
          const dayTasks = byDate.get(key) ?? [];
          const dayClients = clientsByDate.get(key) ?? [];
          const isToday = isCurrentMonth && today.getDate() === cell.day;
          const hasActivity = dayTasks.length > 0 || dayClients.length > 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => hasActivity && setSelectedDay(key)}
              className={cn(
                "flex min-h-24 flex-col gap-1 rounded-xl border border-border bg-card p-2 text-left transition-colors",
                isToday && "border-primary",
                hasActivity && "cursor-pointer hover:border-foreground/30",
                !hasActivity && "cursor-default",
              )}
            >
              <span className="flex items-center justify-between">
                <span
                  className={cn(
                    "self-start text-xs font-medium",
                    isToday
                      ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {cell.day}
                </span>
                {dayClients.length > 0 && (
                  <span title={`${dayClients.length} new lead${dayClients.length === 1 ? "" : "s"}`}>
                    <UserPlus className="size-3 text-primary" />
                  </span>
                )}
              </span>
              {dayTasks.slice(0, 3).map((t) => (
                <span key={t.id} className="flex items-center gap-1.5 truncate rounded-md bg-accent px-1.5 py-0.5 text-[0.7rem] text-accent-foreground" title={t.title}>
                  <span className={cn("size-1.5 shrink-0 rounded-full", PRIORITY_DOT[t.priority])} aria-hidden="true" />
                  <span className="truncate">{t.title}</span>
                </span>
              ))}
              {dayTasks.length > 3 && <span className="text-[0.7rem] text-muted-foreground">+{dayTasks.length - 3} more</span>}
            </button>
          );
        })}
      </div>

      {/* agenda list for phone width */}
      <div className="flex flex-col gap-2 sm:hidden">
        {agenda.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Nothing due this month" description="Tasks with a due date show up here." />
        ) : (
          agenda.map(([key, dayTasks]) => {
            const date = new Date(key);
            const isToday = isCurrentMonth && today.getDate() === date.getDate();
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(key)}
                className="rounded-xl border border-border bg-card p-3 text-left"
              >
                <p className={cn("mb-1.5 text-xs font-medium uppercase tracking-wide", isToday ? "text-primary" : "text-muted-foreground")}>
                  {date.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
                  {isToday && " · Today"}
                </p>
                <div className="flex flex-col gap-1">
                  {dayTasks.map((t) => (
                    <span key={t.id} className="flex items-center gap-1.5 truncate rounded-md bg-accent px-2 py-1 text-sm text-accent-foreground">
                      <span className={cn("size-1.5 shrink-0 rounded-full", PRIORITY_DOT[t.priority])} aria-hidden="true" />
                      {t.title}
                    </span>
                  ))}
                </div>
              </button>
            );
          })
        )}
      </div>

      <Sheet open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <SheetContent open={selectedDay !== null}>
          <SheetHeader>
            <SheetTitle>
              {selectedDay &&
                new Date(selectedDay).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </SheetTitle>
            <SheetDescription>
              {selectedTasks.length} task{selectedTasks.length === 1 ? "" : "s"} due
              {selectedClients.length > 0 &&
                ` · ${selectedClients.length} new lead${selectedClients.length === 1 ? "" : "s"}`}
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="flex flex-col gap-5">
            {selectedTasks.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Due today</p>
                {selectedTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm">
                    <Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge>
                    <span className="flex-1 truncate">{t.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{TASK_STATUS_LABELS[t.status]}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedClients.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">New leads</p>
                {selectedClients.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm">
                    <UserPlus className="size-4 shrink-0 text-primary" />
                    <span className="flex-1 truncate">{c.name || c.email || "Unnamed lead"}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
