import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "@/lib/api";
import { RETAINER_TIERS } from "@/lib/retainerTiers";
import { StatCard } from "@/components/overview/StatCard";
import { MRRTrend } from "@/components/warroom/MRRTrend";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

// Same restrained stagger as Overview - the numbers settle in on load
// rather than popping in all at once, skipped entirely under
// reduced-motion.
const STAGGER_CONTAINER = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } },
};

// A muted, non-primary-accent palette for the tier bars - MRR itself
// already owns the coral accent (StatCard), these just need to read as
// distinct segments, not compete for attention.
const TIER_COLORS = ["var(--color-info)", "var(--color-success)", "var(--color-warning)", "var(--color-primary)"];

function formatGel(n: number) {
  return `${n.toLocaleString()}₾`;
}

export function WarRoomPage() {
  const reduceMotion = useReducedMotion();
  const engagementsQuery = useQuery({ queryKey: ["engagements"], queryFn: api.engagements.list });
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });

  const clientsById = useMemo(
    () => new Map((clientsQuery.data ?? []).map((c) => [c.id, c])),
    [clientsQuery.data],
  );

  const activeRetainers = useMemo(
    () => (engagementsQuery.data ?? []).filter((p) => p.is_retainer && p.status === "active"),
    [engagementsQuery.data],
  );

  const mrr = activeRetainers.reduce((sum, p) => sum + (p.monthly_rate ?? 0), 0);
  const byTier = RETAINER_TIERS.map((t) => ({
    name: t.name,
    count: activeRetainers.filter((p) => p.retainer_tier === t.name).length,
  }));
  const avgRate = activeRetainers.length > 0 ? Math.round(mrr / activeRetainers.length) : 0;

  if (engagementsQuery.isLoading || clientsQuery.isLoading) {
    // mirrors the loaded page: title, 4 stat cards, trend chart, two list cards
    return (
      <div className="flex flex-col gap-4 pt-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  // a revenue page must never present a failed fetch as ₾0 MRR — surface
  // the failure instead of rendering zeros that look like real numbers
  if (engagementsQuery.isError || clientsQuery.isError) {
    const failed = engagementsQuery.isError ? engagementsQuery : clientsQuery;
    return (
      <div className="pt-6">
        <ErrorState
          title="Couldn't load revenue data"
          message={failed.error?.message}
          onRetry={() => {
            engagementsQuery.refetch();
            clientsQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">War Room</h1>
        <p className="text-sm text-muted-foreground">Real recurring revenue, from real retainer data — not estimates.</p>
      </div>

      <motion.div
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={STAGGER_CONTAINER}
      >
        <motion.div variants={STAGGER_ITEM}>
          <StatCard label="Monthly recurring revenue" value={formatGel(mrr)} accent />
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <StatCard label="Active retainer clients" value={activeRetainers.length} />
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <StatCard label="Average rate" value={activeRetainers.length > 0 ? formatGel(avgRate) : "—"} />
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <StatCard label="Annualized (ARR)" value={formatGel(mrr * 12)} />
        </motion.div>
      </motion.div>

      <MRRTrend engagements={engagementsQuery.data ?? []} />

      <Card>
        <CardHeader>
          <CardTitle>By tier</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-3 px-5 pb-5">
          {byTier.every((t) => t.count === 0) ? (
            <p className="py-6 text-sm text-muted-foreground">No active retainers on a tier yet.</p>
          ) : (
            <>
              <div className="flex h-2 gap-px overflow-hidden rounded-full bg-muted">
                {byTier
                  .filter((t) => t.count > 0)
                  .map((t, i) => (
                    <div
                      key={t.name}
                      style={{ width: `${(t.count / activeRetainers.length) * 100}%`, backgroundColor: TIER_COLORS[i % TIER_COLORS.length] }}
                    />
                  ))}
              </div>
              <div className="flex flex-col gap-1">
                {byTier.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: TIER_COLORS[i % TIER_COLORS.length] }} />
                    <span className="flex-1">{t.name}</span>
                    <span className="text-muted-foreground">{t.count} client{t.count === 1 ? "" : "s"}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active retainer clients</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-1 px-5 pb-5">
          {activeRetainers.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No active retainers yet — mark a project as an ongoing retainer and set its monthly rate.
            </p>
          ) : (
            activeRetainers
              .sort((a, b) => (b.monthly_rate ?? 0) - (a.monthly_rate ?? 0))
              .map((p) => {
                const client = clientsById.get(p.client_id ?? "");
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
                    <span className="flex-1 truncate font-medium">{client?.name || client?.email || p.title}</span>
                    {p.retainer_tier && <Badge variant="outline">{p.retainer_tier}</Badge>}
                    <span className="w-24 text-right tabular-nums text-muted-foreground">
                      {formatGel(p.monthly_rate ?? 0)}/mo
                    </span>
                  </div>
                );
              })
          )}
        </div>
      </Card>
    </div>
  );
}
