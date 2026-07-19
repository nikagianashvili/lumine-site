import { cn } from "@portal/lib/utils";

// A plain div-based bar (matches the pattern already proven in the admin's
// BandwidthView), not @radix-ui/react-progress - the value here is always
// known synchronously (never an indeterminate loading state), so the
// primitive doesn't earn its keep. role="progressbar" + aria-value* still
// makes it a real accessible progress indicator, not just colored divs.
export function Progress({ value, className, trackClassName }: { value: number; className?: string; trackClassName?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", trackClassName)}
    >
      <div
        className={cn("h-full rounded-full bg-primary transition-[width] duration-300", className)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
