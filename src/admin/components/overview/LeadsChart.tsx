import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export interface DayCount {
  date: string; // "Jul 1"
  count: number;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-popover-foreground">{payload[0].value} new leads</p>
    </div>
  );
}

export function LeadsChart({ data }: { data: DayCount[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads over time</CardTitle>
        <p className="text-sm text-muted-foreground">New contact-form and chat leads, last 14 days</p>
      </CardHeader>
      <div className="h-56 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
            <defs>
              <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              interval={2}
              fontSize={11}
              stroke="var(--color-muted-foreground)"
              padding={{ left: 16, right: 16 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-border)" }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#leadsFill)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-primary)", stroke: "var(--color-card)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
