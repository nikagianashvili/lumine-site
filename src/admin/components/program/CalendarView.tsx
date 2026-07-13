import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api, type Task } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function CalendarView() {
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });
  const [cursor, setCursor] = useState(() => new Date());

  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasksQuery.data ?? []) {
      if (!t.due_date) continue;
      const key = t.due_date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    }
    return map;
  }, [tasksQuery.data]);

  if (tasksQuery.isLoading) return <Skeleton className="h-[32rem]" />;
  if (tasksQuery.isError) {
    return <p className="text-sm text-destructive">Couldn't load tasks: {tasksQuery.error.message}</p>;
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-40 text-center font-display text-lg font-medium">
          {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </span>
        <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {DOW.map((d) => (
          <div key={d} className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (cell.day === null) return <div key={i} className="min-h-24 rounded-xl" />;
          const key = dayKey(year, month, cell.day);
          const dayTasks = byDate.get(key) ?? [];
          const isToday = isCurrentMonth && today.getDate() === cell.day;
          return (
            <div
              key={i}
              className={cn(
                "flex min-h-24 flex-col gap-1 rounded-xl border border-border bg-card p-2",
                isToday && "border-primary",
              )}
            >
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
              {dayTasks.slice(0, 3).map((t) => (
                <span
                  key={t.id}
                  className="truncate rounded-md bg-accent px-1.5 py-0.5 text-[0.7rem] text-accent-foreground"
                  title={t.title}
                >
                  {t.title}
                </span>
              ))}
              {dayTasks.length > 3 && (
                <span className="text-[0.7rem] text-muted-foreground">+{dayTasks.length - 3} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
