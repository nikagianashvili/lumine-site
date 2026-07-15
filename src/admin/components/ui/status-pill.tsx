import { cn } from "@/lib/utils";
import type { ClientStatus } from "@/lib/api";

// Client pipeline-stage colors, previously duplicated verbatim in
// ConversationCard and ClientsTable (with a comment promising to keep them
// in sync by hand). Exported raw for the one place that needs to style a
// SelectTrigger as a pill; everything else renders <StatusPill>.
export const CLIENT_STATUS_CLASSES: Record<ClientStatus, string> = {
  hot: "bg-destructive/10 text-destructive",
  warm: "bg-warning-tint text-warning",
  new: "bg-info-tint text-info",
  client: "bg-success-tint text-success",
  cold: "bg-muted text-muted-foreground",
  lost: "bg-muted text-muted-foreground",
};

export function StatusPill({ status, className }: { status: ClientStatus; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-semibold uppercase",
        CLIENT_STATUS_CLASSES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
