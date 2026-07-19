import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// Drag handle only appears in edit mode - the rest of the time a widget
// looks and behaves exactly like a normal part of the page, charts and all
// stay fully interactive. Wraps one widget (not a row of them) so any
// widget can be dragged to any position in the grid, not just reordered
// within a fixed group.
export function SortableWidget({ id, editing, children }: { id: string; editing: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative rounded-2xl transition-shadow", isDragging && "z-10 opacity-80 shadow-lg")}
    >
      {editing && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder this widget"
          className="absolute -left-3 top-1/2 z-10 flex h-7 w-7 -translate-x-full -translate-y-1/2 cursor-grab items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground active:cursor-grabbing max-lg:hidden"
        >
          <GripVertical className="size-4" />
        </button>
      )}
      <div
        className={cn(
          "rounded-2xl transition-shadow",
          editing && "outline outline-2 outline-dashed outline-border/70 outline-offset-4",
        )}
      >
        {children}
      </div>
    </div>
  );
}
