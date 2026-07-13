import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatCard } from "@/components/overview/StatCard";
import { LeadsChart, type DayCount } from "@/components/overview/LeadsChart";
import { SourceBreakdown } from "@/components/overview/SourceBreakdown";
import { ActivityFeed } from "@/components/overview/ActivityFeed";
import { Skeleton } from "@/components/ui/skeleton";

const DAY_MS = 24 * 60 * 60 * 1000;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function OverviewPage() {
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });

  if (clientsQuery.isLoading || tasksQuery.isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 pt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (clientsQuery.isError || tasksQuery.isError) {
    return (
      <div className="pt-6 text-sm text-destructive">
        Couldn't load dashboard data: {(clientsQuery.error || tasksQuery.error)?.message}
      </div>
    );
  }

  const clients = clientsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];

  const now = Date.now();
  const weekAgo = now - 7 * DAY_MS;
  const leadsThisWeek = clients.filter((c) => new Date(c.created_at).getTime() >= weekAgo).length;
  const hotLeads = clients.filter((c) => c.status === "hot").length;
  const booked = clients.filter((c) => c.status === "client").length;
  const aiQualified = clients.filter((c) => c.source === "ai_chat" || c.source === "ai_consultant").length;

  const days: DayCount[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * DAY_MS);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + DAY_MS;
    const count = clients.filter((c) => {
      const t = new Date(c.created_at).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    return { date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count };
  });

  const sourceCounts = clients.reduce<Record<string, number>>((acc, c) => {
    acc[c.source] = (acc[c.source] || 0) + 1;
    return acc;
  }, {});

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-5 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{greeting()}</h1>
        <p className="text-sm text-muted-foreground">Here's what's moved since you last checked in.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Leads this week" value={leadsThisWeek} />
        <StatCard label="Hot leads" value={hotLeads} />
        <StatCard label="Booked clients" value={booked} />
        <StatCard label="AI-qualified" value={aiQualified} accent />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LeadsChart data={days} />
        </div>
        <div className="lg:col-span-2">
          <SourceBreakdown counts={sourceCounts} />
        </div>
      </div>

      <ActivityFeed clients={recentClients} tasks={recentTasks} />
    </div>
  );
}
