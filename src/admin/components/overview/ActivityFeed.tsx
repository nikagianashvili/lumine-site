import { UserPlus, ListTodo } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Client, Task } from "@/lib/api";

interface Entry {
  id: string;
  icon: typeof UserPlus;
  text: string;
  time: string;
  accent?: boolean;
}

export function ActivityFeed({ clients, tasks }: { clients: Client[]; tasks: Task[] }) {
  const entries: Entry[] = [
    ...clients.map((c) => ({
      id: `client-${c.id}`,
      icon: UserPlus,
      text: `New lead: ${c.name || c.email || "Unnamed"}`,
      time: c.created_at,
      accent: c.source === "ai_chat" || c.source === "ai_consultant",
    })),
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      icon: ListTodo,
      text: `Task created: ${t.title}`,
      time: t.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8)
    .map((e) => ({ ...e, time: timeAgo(e.time) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-1 px-5 pb-5">
        {entries.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">No activity yet — new leads and tasks show up here.</p>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
              <span
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                  e.accent ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                <e.icon className="size-4" />
              </span>
              <span className="flex-1 truncate">{e.text}</span>
              <span className="flex-shrink-0 text-xs text-muted-foreground">{e.time}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
