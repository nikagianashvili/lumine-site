import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_VARIANT, TASK_STATUS_LABELS } from "@/lib/taskMeta";
import { formatDateShort } from "@/lib/format";
import type { Task } from "@/lib/api";

export function MyQueue({ tasks, title }: { tasks: Task[]; title: string }) {
  const open = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-1 px-5 pb-5">
        {open.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">Nothing assigned to you right now.</p>
        ) : (
          open.slice(0, 8).map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
              <Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge>
              <span className="flex-1 truncate">{t.title}</span>
              <span className="flex-shrink-0 text-xs text-muted-foreground">{TASK_STATUS_LABELS[t.status]}</span>
              <span className="flex-shrink-0 text-xs text-muted-foreground">
                {t.due_date ? formatDateShort(t.due_date) : "—"}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
