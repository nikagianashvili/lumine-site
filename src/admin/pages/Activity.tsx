import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, ListTodo, Briefcase, MessageSquare, PartyPopper } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Entry {
  id: string;
  icon: typeof UserPlus;
  text: string;
  time: string;
  accent?: boolean;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

// A real unified feed (Phase 9) - client/project/task/conversation events
// merged and sorted by recency, reusing Overview's ActivityFeed item
// pattern but page-scoped and covering everything, not just clients+tasks.
export function ActivityPage() {
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });
  const engagementsQuery = useQuery({ queryKey: ["engagements"], queryFn: api.engagements.list });
  const convosQuery = useQuery({ queryKey: ["conversations"], queryFn: api.conversations.list });
  const waterCoolerQuery = useQuery({ queryKey: ["water-cooler"], queryFn: api.waterCooler.list });

  const loading =
    clientsQuery.isLoading || tasksQuery.isLoading || engagementsQuery.isLoading || convosQuery.isLoading;

  const entries = useMemo<Entry[]>(() => {
    const list: Entry[] = [];

    for (const c of clientsQuery.data ?? []) {
      list.push({
        id: `client-${c.id}`,
        icon: UserPlus,
        text: `New lead: ${c.name || c.email || "Unnamed"}`,
        time: c.created_at,
        accent: c.source === "ai_chat" || c.source === "ai_consultant",
      });
    }
    for (const t of tasksQuery.data ?? []) {
      list.push({ id: `task-${t.id}`, icon: ListTodo, text: `Task created: ${t.title}`, time: t.created_at });
    }
    for (const p of engagementsQuery.data ?? []) {
      list.push({ id: `project-${p.id}`, icon: Briefcase, text: `Project started: ${p.title}`, time: p.created_at });
      if (p.completed_at) {
        list.push({
          id: `project-done-${p.id}`,
          icon: PartyPopper,
          text: `Project shipped: ${p.title}`,
          time: p.completed_at,
          accent: true,
        });
      }
    }
    for (const c of convosQuery.data ?? []) {
      list.push({
        id: `convo-${c.id}`,
        icon: MessageSquare,
        text: `AI conversation with ${c.clients?.name || c.clients?.email || "a visitor"}`,
        time: c.created_at,
        accent: true,
      });
    }
    for (const post of waterCoolerQuery.data ?? []) {
      list.push({
        id: `wc-${post.id}`,
        icon: PartyPopper,
        text: post.type === "celebration" ? post.body : `${post.team_members?.name || "Someone"}: ${post.body}`,
        time: post.created_at,
      });
    }

    return list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 60);
  }, [clientsQuery.data, tasksQuery.data, engagementsQuery.data, convosQuery.data, waterCoolerQuery.data]);

  return (
    <div className="flex max-w-2xl flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Activity</h1>
        <p className="text-sm text-muted-foreground">Everything that's happened, in one feed.</p>
      </div>

      {loading && <Skeleton className="h-96" />}

      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle>Recent</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-1 px-5 pb-5">
            {entries.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">Nothing yet.</p>
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
                  <span className="flex-shrink-0 text-xs text-muted-foreground">{timeAgo(e.time)}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
