import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { FolderOpen, CheckCircle2, Clock } from "lucide-react";
import { api } from "@portal/lib/api";
import { useDelayedLoading } from "@portal/lib/useDelayedLoading";
import { Card, CardHeader, CardTitle, CardDescription } from "@portal/components/ui/card";
import { Progress } from "@portal/components/ui/progress";
import { Skeleton } from "@portal/components/ui/skeleton";
import { ErrorState } from "@portal/components/ui/error-state";
import { EmptyState } from "@portal/components/ui/empty-state";
import { EngagementStatusPill, TaskStatusPill } from "@portal/components/ui/status-pill";
import { timeAgo } from "@portal/lib/format";

// A dashboard that shows everything shows nothing - this is deliberately
// four cards, not a wall of every metric the API could return: what's
// active, what needs the client's attention, what just landed, what's
// moving. Anything else lives on its own page.
//
// One deliberate motion moment - the bento cards stagger in on load - not
// scattered everywhere. Skipped entirely under reduced-motion.
const STAGGER_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const } },
};

export function DashboardPage() {
  const reduceMotion = useReducedMotion();
  const engagementsQuery = useQuery({ queryKey: ["portal", "engagements"], queryFn: api.engagements.list });
  const tasksQuery = useQuery({ queryKey: ["portal", "tasks"], queryFn: api.tasks.list });
  const filesQuery = useQuery({ queryKey: ["portal", "files", "creative"], queryFn: () => api.files.list("creative") });

  const isLoading = engagementsQuery.isLoading || tasksQuery.isLoading || filesQuery.isLoading;
  const showLoading = useDelayedLoading(isLoading);
  const isError = engagementsQuery.isError || tasksQuery.isError || filesQuery.isError;

  const activeEngagements = useMemo(
    () => (engagementsQuery.data ?? []).filter((e) => e.status === "active"),
    [engagementsQuery.data],
  );

  const recentTasks = useMemo(
    () => [...(tasksQuery.data ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
    [tasksQuery.data],
  );

  const recentFiles = useMemo(
    () => [...(filesQuery.data ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4),
    [filesQuery.data],
  );

  const pendingApprovals = useMemo(
    () => (filesQuery.data ?? []).filter((f) => !f.approval_status),
    [filesQuery.data],
  );

  function progressFor(engagementId: string) {
    const relatedTasks = (tasksQuery.data ?? []).filter((t) => t.engagement_id === engagementId);
    if (relatedTasks.length > 0) {
      const done = relatedTasks.filter((t) => t.status === "done").length;
      return { pct: (done / relatedTasks.length) * 100, label: `${done} of ${relatedTasks.length} tasks complete` };
    }
    const eng = (engagementsQuery.data ?? []).find((e) => e.id === engagementId);
    if (eng?.is_retainer && eng.posters_limit) {
      const pct = ((eng.posters_delivered ?? 0) / eng.posters_limit) * 100;
      return { pct, label: `${eng.posters_delivered ?? 0} of ${eng.posters_limit} posters delivered this month` };
    }
    return { pct: 0, label: "Just getting started" };
  }

  if (showLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="col-span-1 h-56 rounded-xl sm:col-span-2" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="col-span-1 h-40 rounded-xl sm:col-span-2 lg:col-span-4" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-6">
        <ErrorState
          title="Couldn't load your dashboard"
          message="Something went wrong reaching Lumine's servers."
          onRetry={() => {
            engagementsQuery.refetch();
            tasksQuery.refetch();
            filesQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Where your projects stand, right now.</p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={STAGGER_CONTAINER}
      >
        {/* dominant block: this is the one thing a client opens the portal to check */}
        <motion.div className="sm:col-span-2" variants={STAGGER_ITEM}>
          <Card>
            <CardHeader>
              <CardTitle>Active Project Status</CardTitle>
              <CardDescription>{activeEngagements.length === 0 ? "No active projects right now" : "Progress across your current work"}</CardDescription>
            </CardHeader>
            {activeEngagements.length === 0 ? (
              <div className="px-5 pb-5">
                <EmptyState icon={FolderOpen} title="No active projects" description="When Lumine starts work on your account, it'll show up here." />
              </div>
            ) : (
              <div className="flex flex-col gap-4 px-5 pb-5">
                {activeEngagements.map((e) => {
                  const { pct, label } = progressFor(e.id);
                  return (
                    <div key={e.id} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{e.title}</span>
                        <EngagementStatusPill status={e.status} />
                      </div>
                      <Progress value={pct} />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={STAGGER_ITEM}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-warning" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-2 px-5 pb-5">
              <p className="font-display text-3xl font-bold">{pendingApprovals.length}</p>
              <p className="text-sm text-muted-foreground">
                {pendingApprovals.length === 0 ? "Nothing waiting on you" : "Deliverable" + (pendingApprovals.length === 1 ? "" : "s") + " ready to review"}
              </p>
              {pendingApprovals.length > 0 && (
                <a href="/portal?page=deliverables" className="mt-1 text-sm font-medium text-primary hover:underline">
                  Review Now →
                </a>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={STAGGER_ITEM}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="size-4 text-success" />
                Recent Deliverables
              </CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-1 px-5 pb-5">
              {recentFiles.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">Nothing delivered yet.</p>
              ) : (
                recentFiles.map((f) => (
                  <a
                    key={f.id}
                    href={`/portal?page=deliverables&file=${f.id}`}
                    className="truncate rounded-lg py-1 text-sm text-foreground hover:text-primary hover:underline"
                    title={f.name}
                  >
                    {f.name}
                  </a>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div className="sm:col-span-2 lg:col-span-4" variants={STAGGER_ITEM}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-1 px-5 pb-5">
              {recentTasks.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">No project activity yet.</p>
              ) : (
                recentTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-lg px-1 py-1.5 text-sm">
                    <span className="flex-1 truncate">{t.title}</span>
                    <TaskStatusPill status={t.status} />
                    <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">{timeAgo(t.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
