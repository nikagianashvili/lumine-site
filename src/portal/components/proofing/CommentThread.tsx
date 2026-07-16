import { X, Check } from "lucide-react";
import type { DeliverableComment } from "@portal/lib/api";
import { Button } from "@portal/components/ui/button";
import { timeAgo, formatTimecode } from "@portal/lib/format";
import { cn } from "@portal/lib/utils";

function commentAnchorLabel(c: DeliverableComment) {
  if (c.timecode_seconds != null) return `at ${formatTimecode(c.timecode_seconds)}`;
  if (c.x_pct != null) return "on pinned spot";
  return null;
}

export function CommentThread({
  comments,
  pendingLabel,
  draft,
  onDraftChange,
  onSubmit,
  onCancelPin,
  onToggleResolve,
  submitting,
}: {
  comments: DeliverableComment[];
  pendingLabel: string | null;
  draft: string;
  onDraftChange: (v: string) => void;
  onSubmit: () => void;
  onCancelPin: () => void;
  onToggleResolve: (id: string, resolved: boolean) => void;
  submitting: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No feedback yet. Click the deliverable to leave your first note.</p>
        ) : (
          comments.map((c) => {
            const author = c.client_users?.name || c.team_members?.name || "Someone";
            const anchor = commentAnchorLabel(c);
            return (
              <div key={c.id} className={cn("rounded-xl border border-border p-3", c.resolved && "opacity-60")}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-medium">{author}</span>
                    {c.team_members && <span className="ml-1.5 rounded-full bg-info-tint px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase text-info">Lumine</span>}
                    {anchor && <span className="ml-1.5 text-xs text-muted-foreground">{anchor}</span>}
                  </div>
                  <button
                    type="button"
                    title={c.resolved ? "Mark unresolved" : "Mark resolved"}
                    onClick={() => onToggleResolve(c.id, !c.resolved)}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
                      c.resolved ? "bg-success-tint text-success" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Check className="size-3.5" />
                  </button>
                </div>
                <p className="mt-1 text-sm">{c.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{timeAgo(c.created_at)}</p>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
        {pendingLabel && (
          <div className="flex items-center gap-2 rounded-lg bg-accent px-2.5 py-1.5 text-xs text-accent-foreground">
            <span className="flex-1">Commenting {pendingLabel}</span>
            <button type="button" onClick={onCancelPin} aria-label="Cancel pin">
              <X className="size-3.5" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Leave feedback…"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
          <Button type="button" size="sm" className="self-end" disabled={!draft.trim() || submitting} onClick={onSubmit}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
