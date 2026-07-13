import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClientSource } from "@/lib/api";

const SOURCE_META: Record<ClientSource, { label: string; color: string }> = {
  contact_form: { label: "Contact form", color: "var(--chart-contact-form)" },
  manual: { label: "Manual", color: "var(--chart-manual)" },
  ai_chat: { label: "AI chat", color: "var(--chart-ai-chat)" },
  ai_consultant: { label: "AI consultant", color: "var(--chart-ai-consultant)" },
};

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold tabular-nums text-popover-foreground">
        {name}: {value}
      </p>
    </div>
  );
}

export function SourceBreakdown({ counts }: { counts: Record<string, number> }) {
  const data = (Object.keys(SOURCE_META) as ClientSource[])
    .map((key) => ({ key, name: SOURCE_META[key].label, value: counts[key] || 0 }))
    .filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead sources</CardTitle>
        <p className="text-sm text-muted-foreground">Where every lead on record came from</p>
      </CardHeader>
      <div className="flex items-center gap-4 px-5 pb-5">
        {total === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">No leads yet.</p>
        ) : (
          <>
            <div className="h-40 w-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={44} outerRadius={68} strokeWidth={2}>
                    {data.map((d) => (
                      <Cell key={d.key} fill={SOURCE_META[d.key].color} stroke="var(--color-card)" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-1 flex-col gap-2 text-sm">
              {data.map((d) => (
                <li key={d.key} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: SOURCE_META[d.key].color }}
                    />
                    {d.name}
                  </span>
                  <span className="tabular-nums font-medium text-foreground">{d.value}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}
