import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
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

// One deliberate motion moment on this dashboard, not scattered everywhere:
// the stat cards stagger in on load. staggerChildren is skipped entirely
// under reduced-motion rather than just shortened, so nothing moves.
const STAGGER_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function OverviewPage() {
  const reduceMotion = useReducedMotion();
  const session = getSession();
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  const convosQuery = useQuery({ queryKey: ["conversations"], queryFn: api.conversations.list });

  if (clientsQuery.isLoading || tasksQuery.isLoading) {
    // mirrors the loaded page: greeting block, hero stat, ledger, chart row
    return (
      <div className="flex flex-col gap-5 pt-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-16 w-32" />
          <Skeleton className="h-16 rounded-xl" />
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

  // The dashboard leads with whichever number most needs a decision today,
  // set as a real headline — not boxed into a card equal to the rest. The
  // other three step back into a quiet ledger strip. Priority: a hot lead
  // outranks a routine weekly count, which outranks a passive booked total.
  const allStats = [
    { key: "leadsThisWeek", label: "Leads this wk", value: leadsThisWeek, accent: false },
    { key: "hotLeads", label: "Hot leads", value: hotLeads, accent: false },
    { key: "booked", label: "Booked", value: booked, accent: false },
    { key: "aiQualified", label: "AI-qualified", value: aiQualified, accent: true },
  ] as const;
  const heroKey =
    (["hotLeads", "leadsThisWeek", "booked"] as const).find(
      (k) => allStats.find((s) => s.key === k)!.value > 0,
    ) ?? "leadsThisWeek";
  const hero = allStats.find((s) => s.key === heroKey)!;
  const heroLabel =
    heroKey === "hotLeads"
      ? hero.value === 1
        ? "hot lead waiting"
        : "hot leads waiting"
      : heroKey === "booked"
        ? hero.value === 1
          ? "booked client"
          : "booked clients"
        : "new leads this week";
  const ledgerStats = allStats.filter((s) => s.key !== heroKey);

  return (
    <div className="flex flex-col gap-5 pt-6">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Here's what's moved since you last checked in.</p>
        </div>
        <p className="hidden shrink-0 text-sm text-muted-foreground sm:block">
          {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
        </p>
      </div>

      <motion.div
        className="flex flex-col gap-4"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={STAGGER_CONTAINER}
      >
        <motion.div variants={STAGGER_ITEM} className="flex flex-col gap-2">
          <p className="font-display text-6xl font-bold leading-none tabular-nums sm:text-7xl">{hero.value}</p>
          <div className="flex items-center gap-3">
            <span className="h-[3px] w-8 bg-primary" aria-hidden="true" />
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{heroLabel}</p>
          </div>
        </motion.div>

        <motion.div
          variants={STAGGER_ITEM}
          className="flex flex-wrap divide-x divide-border overflow-hidden rounded-xl border border-border bg-card"
        >
          {ledgerStats.map((s) => (
            <div key={s.key} className="min-w-[8rem] flex-1 px-5 py-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p
                className={cn(
                  "mt-1 font-display text-xl font-semibold tabular-nums",
                  s.accent && "text-primary",
                )}
              >
                {s.value}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>

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
