import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import { StatCard } from "@/components/overview/StatCard";
import { LeadsChart, type DayCount } from "@/components/overview/LeadsChart";
import { SourceBreakdown } from "@/components/overview/SourceBreakdown";
import { ActivityFeed } from "@/components/overview/ActivityFeed";
import { MyQueue } from "@/components/overview/MyQueue";
import { InboxSummary } from "@/components/overview/InboxSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

const DAY_MS = 24 * 60 * 60 * 1000;

// Specialty label on team_members.role -> which Overview variant they see.
// Free text, no permissions attached - anything unrecognized (including
// "Founder") falls through to the full agency-wide view below.
type Variant = "orchestrator" | "media" | "design" | "full";

function variantFor(role: string | undefined) {
  switch ((role || "").toLowerCase()) {
    case "orchestrator":
      return "orchestrator" as Variant;
    case "media":
      return "media" as Variant;
    case "design":
      return "design" as Variant;
    default:
      return "full" as Variant;
  }
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function OverviewPage() {
  const session = getSession();
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  const convosQuery = useQuery({ queryKey: ["conversations"], queryFn: api.conversations.list });

  if (clientsQuery.isLoading || tasksQuery.isLoading) {
    // mirrors the loaded page: greeting block, stat grid, chart row
    return (
      <div className="flex flex-col gap-5 pt-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Skeleton className="h-72 rounded-xl lg:col-span-3" />
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (clientsQuery.isError || tasksQuery.isError) {
    const failed = clientsQuery.isError ? clientsQuery : tasksQuery;
    return (
      <div className="pt-6">
        <ErrorState
          title="Couldn't load the dashboard"
          message={failed.error?.message}
          onRetry={() => {
            clientsQuery.refetch();
            tasksQuery.refetch();
          }}
        />
      </div>
    );
  }

  const clients = clientsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const me = teamQuery.data?.find((m) => m.id === session?.user.id);
  const variant = variantFor(me?.role);
  const myTasks = tasks.filter((t) => t.assignee === session?.user.id);
  const myClients = clients.filter((c) => c.assigned_to === session?.user.id);

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
  const recentMyClients = [...myClients]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const firstName = me?.name?.trim().split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-5 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">Here's what's moved since you last checked in.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Leads this week" value={leadsThisWeek} />
        <StatCard label="Hot leads" value={hotLeads} />
        <StatCard label="Booked clients" value={booked} />
        <StatCard label="AI-qualified" value={aiQualified} accent />
      </div>

      {variant === "full" && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <LeadsChart data={days} />
            </div>
            <div className="lg:col-span-2">
              <SourceBreakdown counts={sourceCounts} />
            </div>
          </div>
          <ActivityFeed clients={recentClients} tasks={recentTasks} />
        </>
      )}

      {variant === "orchestrator" && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <LeadsChart data={days} />
            </div>
            <div className="lg:col-span-2">
              <SourceBreakdown counts={sourceCounts} />
            </div>
          </div>
          <InboxSummary conversations={convosQuery.data ?? []} />
          <ActivityFeed clients={recentMyClients} tasks={[]} />
        </>
      )}

      {variant === "media" && <MyQueue tasks={myTasks} title="Shoot schedule" />}
      {variant === "design" && <MyQueue tasks={myTasks} title="Design queue" />}
    </div>
  );
}
