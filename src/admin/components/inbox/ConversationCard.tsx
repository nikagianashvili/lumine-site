import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Sparkles } from "lucide-react";
import { api, type Conversation, type ClientStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<ClientStatus, string> = {
  hot: "bg-destructive/10 text-destructive",
  warm: "bg-warning-tint text-warning",
  new: "bg-info-tint text-info",
  client: "bg-success-tint text-success",
  cold: "bg-muted text-muted-foreground",
  lost: "bg-muted text-muted-foreground",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function ConversationCard({ convo }: { convo: Conversation }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const client = convo.clients;
  const escalated = convo.status === "qualified";
  const handled = convo.status === "closed";

  const handleMutation = useMutation({
    mutationFn: () => api.conversations.update(convo.id, { status: "closed" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{client?.name || "Unknown visitor"}</p>
          <p className="text-xs text-muted-foreground">
            {[client?.email, client?.company].filter(Boolean).join(" · ") || "—"} · {timeAgo(convo.created_at)}
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {escalated && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold uppercase text-destructive">
              Needs you
            </span>
          )}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold uppercase",
              STATUS_CLASSES[client?.status ?? "new"],
            )}
          >
            {client?.status ?? "new"}
          </span>
        </div>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{convo.summary || "No summary available."}</p>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 flex items-center gap-1 text-sm font-medium text-primary"
      >
        {expanded ? "Hide conversation" : "View conversation"}
        <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          {convo.transcript.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages recorded.</p>
          ) : (
            convo.transcript.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  m.role === "assistant"
                    ? "self-start bg-accent text-accent-foreground"
                    : "self-end bg-foreground text-background",
                )}
              >
                {m.role === "assistant" && <Sparkles className="mb-1 inline size-3 opacity-60" />}
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-3 flex justify-end border-t border-border pt-3">
        <Button
          variant="outline"
          size="sm"
          disabled={handled || handleMutation.isPending}
          onClick={() => handleMutation.mutate()}
        >
          {handled ? "Handled" : handleMutation.isPending ? "Marking…" : "Mark handled"}
        </Button>
      </div>
    </div>
  );
}
