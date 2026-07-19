import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Engagement } from "@/lib/api";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKS = 12; // ~one quarter

function formatGel(n: number) {
  return `${n.toLocaleString()}₾`;
}

// There's no separate MRR-history table - every past value here is
// reconstructed from the same engagements rows the current MRR figure
// already sums, using created_at/completed_at as the only signal for
// "was this retainer active as of this week." That's a real, honest
// number derived from data that exists, not a new metric to maintain -
// it just can't account for a retainer that went active, inactive, and
// active again, since only one completed_at is tracked, not a full
// status history.
function buildWeeklyMrr(engagements: Engagement[]): { week: string; mrr: number }[] {
  const retainers = engagements.filter((e) => e.is_retainer && e.monthly_rate);
  if (retainers.length === 0) return [];

  const now = Date.now();
  const points: { week: string; mrr: number }[] = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const asOf = new Date(now - i * WEEK_MS);
    const mrr = retainers.reduce((sum, e) => {
      const started = new Date(e.created_at).getTime();
      const ended = e.completed_at ? new Date(e.completed_at).getTime() : null;
      const wasActive = started <= asOf.getTime() && (ended === null || ended > asOf.getTime());
      return wasActive ? sum + (e.monthly_rate ?? 0) : sum;
    }, 0);
    points.push({ week: asOf.toLocaleDateString(undefined, { month: "short", day: "numeric" }), mrr });
  }
  return points;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">Week of {label}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-popover-foreground">{formatGel(payload[0].value)} MRR</p>
    </div>
  );
}

export function MRRTrend({ engagements }: { engagements: Engagement[] }) {
  const data = useMemo(() => buildWeeklyMrr(engagements), [engagements]);
  const hasHistory = data.some((d) => d.mrr > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>MRR over time</CardTitle>
        <p className="text-sm text-muted-foreground">Reconstructed from retainer start/end dates, last {WEEKS} weeks</p>
      </CardHeader>
      {!hasHistory ? (
        <p className="px-5 pb-6 py-6 text-sm text-muted-foreground">Not enough retainer history yet to chart a trend.</p>
      ) : (
        <div className="h-56 px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                interval={1}
                fontSize={11}
                stroke="var(--color-muted-foreground)"
                padding={{ left: 16, right: 16 }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-border)" }} />
              <Area
                type="monotone"
                dataKey="mrr"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#mrrFill)"
                dot={false}
                activeDot={{ r: 4, fill: "var(--color-primary)", stroke: "var(--color-card)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
