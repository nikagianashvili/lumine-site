import type { ReactNode } from "react";
import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

// Per-widget hide control, shown only in edit mode. Separate from
// SortableRow (which handles drag-to-reorder at the row level) since a row
// can hold two widgets that hide independently without reordering relative
// to each other.
export function WidgetChrome({ editing, onHide, children }: { editing: boolean; onHide: () => void; children: ReactNode }) {
  return (
    <div className={cn("relative", editing && "rounded-2xl ring-1 ring-dashed ring-border")}>
      {editing && (
        <button
          type="button"
          onClick={onHide}
          aria-label="Hide this widget"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-destructive"
        >
          <EyeOff className="size-3.5" />
        </button>
      )}
      {children}
    </div>
  );
}
