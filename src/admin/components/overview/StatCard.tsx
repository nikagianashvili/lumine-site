import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  delta,
  accent,
}: {
  label: string;
  value: string | number;
  delta?: { direction: "up" | "down"; text: string };
  accent?: boolean;
}) {
  return (
    <Card className={cn("p-5", accent && "border-primary/30 bg-accent")}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums leading-none">{value}</p>
      {delta && (
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            delta.direction === "up" ? "text-success" : "text-muted-foreground",
          )}
        >
          {delta.direction === "up" ? "↑" : "↓"} {delta.text}
        </p>
      )}
    </Card>
  );
}
