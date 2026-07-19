import type { DeliverableComment } from "@portal/lib/api";
import { cn } from "@portal/lib/utils";

export interface PendingPin {
  x_pct: number;
  y_pct: number;
}

// Click-to-drop-pin proofing surface for a still image. Pins are stored as
// percentages of rendered width/height (schema: files x_pct/y_pct), not
// pixels - the same pin then lands in the right spot whether the client
// is on a phone or a 4K monitor, no coordinate translation needed.
export function ImageProofer({
  url,
  alt,
  comments,
  pendingPin,
  onPlacePin,
}: {
  url: string;
  alt: string;
  comments: DeliverableComment[];
  pendingPin: PendingPin | null;
  onPlacePin: (pin: PendingPin) => void;
}) {
  const pinned = comments.filter((c) => c.x_pct != null && c.y_pct != null);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x_pct = ((e.clientX - rect.left) / rect.width) * 100;
    const y_pct = ((e.clientY - rect.top) / rect.height) * 100;
    onPlacePin({ x_pct, y_pct });
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="Click anywhere on the image to leave a pinned comment"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter") onPlacePin({ x_pct: 50, y_pct: 50 });
        }}
        className="relative cursor-crosshair overflow-hidden rounded-xl border border-border bg-muted"
      >
        <img src={url} alt={alt} className="block max-h-[60vh] w-full select-none object-contain" draggable={false} />
        {pinned.map((c, i) => (
          <span
            key={c.id}
            title={c.body}
            className={cn(
              "absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold text-primary-foreground shadow-md",
              c.resolved ? "bg-muted-foreground" : "bg-primary",
            )}
            style={{ left: `${c.x_pct}%`, top: `${c.y_pct}%` }}
          >
            {i + 1}
          </span>
        ))}
        {pendingPin && (
          <span
            className="absolute size-6 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border-2 border-dashed border-primary bg-primary/30"
            style={{ left: `${pendingPin.x_pct}%`, top: `${pendingPin.y_pct}%` }}
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground">Click anywhere on the image to pin a comment to that spot.</p>
    </div>
  );
}
