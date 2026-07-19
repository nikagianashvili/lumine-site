import { STATUS_COLOR } from "@/lib/teamStatus";
import { cn } from "@/lib/utils";

export function StatusDot({ status, focusMode }: { status?: string; focusMode?: boolean }) {
  if (!status) return null;
  return (
    <span
      title={focusMode ? `${status} · Focus Mode` : status}
      className={cn(
        "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card",
        focusMode ? "bg-muted-foreground" : STATUS_COLOR[status] || "bg-muted-foreground",
      )}
    />
  );
}
