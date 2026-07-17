import { Card, CardHeader, CardTitle } from "@/components/ui/card";

// Metronic's "Highlights" widget, reskinned in Lumine's own tokens: a
// headline number with an optional badge, a segmented proportion bar, then
// a divider and a list of icon-dot label/value rows. Every value here comes
// from real client/task data - no fabricated trend arrows.
export interface HighlightSegment {
  key: string;
  color: string;
  weight: number;
}

export interface HighlightRow {
  key: string;
  label: string;
  value: string | number;
  color: string;
}

export function HighlightsCard({
  title,
  value,
  badge,
  segments,
  rows,
}: {
  title: string;
  value: string | number;
  badge?: string;
  segments?: HighlightSegment[];
  rows: HighlightRow[];
}) {
  const total = segments?.reduce((s, seg) => s + seg.weight, 0) || 0;

  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <div className="p-5">
        <div className="flex items-baseline gap-2">
          <p className="font-display text-3xl font-bold tabular-nums leading-none">{value}</p>
          {badge && (
            <span className="rounded-full bg-success-tint px-2 py-0.5 text-xs font-semibold text-success">
              {badge}
            </span>
          )}
        </div>

        {segments && segments.length > 0 && total > 0 && (
          <div className="mt-3 flex h-1.5 gap-px overflow-hidden rounded-full bg-muted">
            {segments.map((seg) => (
              <div key={seg.key} style={{ width: `${(seg.weight / total) * 100}%`, backgroundColor: seg.color }} />
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
                {r.label}
              </span>
              <span className="font-medium tabular-nums text-foreground">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
