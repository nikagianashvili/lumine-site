import { TriangleAlert } from "lucide-react";
import { Button } from "@portal/components/ui/button";
import { cn } from "@portal/lib/utils";

// Errors explain what went wrong and offer the fix (retry) - never a
// vague "something went wrong", per the copy standards this build follows
// (positive, specific, always a way out).
export function ErrorState({
  title = "Couldn't load this",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive-surface px-6 py-10 text-center",
        className,
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-5" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      {message && <p className="max-w-sm text-sm text-muted-foreground">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
