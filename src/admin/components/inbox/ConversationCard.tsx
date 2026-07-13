import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, MessageSquare, Sparkles, TriangleAlert, Phone, Mail, MessageCircle } from "lucide-react";
import { api, type Conversation, type ClientStatus } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
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

const URGENCY_VARIANT = { high: "destructive", medium: "warning", low: "secondary" } as const;
const LOW_CONFIDENCE_THRESHOLD = 0.6;

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function messageTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function ConversationCard({ convo }: { convo: Conversation }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const client = convo.clients;
  const escalated = convo.status === "qualified";
  const handled = convo.status === "closed";
  const meta = client?.meta ?? {};

  const handleMutation = useMutation({
    mutationFn: () => api.conversations.update(convo.id, { status: "closed" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-sm",
        escalated ? "border-destructive/30 bg-destructive/[0.03] border-l-4" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground" title="Channel: chat">
            <MessageSquare className="size-3.5" />
          </span>
          <div>
            <p className="font-medium">{client?.name || "Unknown visitor"}</p>
            <p className="text-xs text-muted-foreground">
              {client?.company || "—"} · {timeAgo(convo.created_at)}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {escalated && (
            <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold uppercase text-destructive">
              <TriangleAlert className="size-3" />
              Needs you
            </span>
          )}
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold uppercase", STATUS_CLASSES[client?.status ?? "new"])}>
            {client?.status ?? "new"}
          </span>
        </div>
      </div>

      {/* Follow-up happens outside this app - the team calls/texts/emails
          directly, they don't reply inside the chat - so these need to be
          one-click actionable, not just displayed text. */}
      {(client?.phone || client?.email) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {client?.phone && (
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
            >
              <Phone className="size-3.5" />
              {client.phone}
            </a>
          )}
          {client?.phone && (
            <a
              href={`sms:${client.phone}`}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
            >
              <MessageCircle className="size-3.5" />
              Text
            </a>
          )}
          {client?.email && (
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
            >
              <Mail className="size-3.5" />
              {client.email}
            </a>
          )}
        </div>
      )}

      {/* AI signal — intent/urgency from the classification step, confidence
          flagged only when low enough a human should double-check it */}
      {(meta.intent || meta.urgency || (typeof meta.confidence === "number" && meta.confidence < LOW_CONFIDENCE_THRESHOLD)) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {meta.intent && <Badge variant="outline">{meta.intent}</Badge>}
          {meta.urgency && <Badge variant={URGENCY_VARIANT[meta.urgency]}>{meta.urgency} urgency</Badge>}
          {typeof meta.confidence === "number" && meta.confidence < LOW_CONFIDENCE_THRESHOLD && (
            <span className="text-xs text-muted-foreground" title="The AI wasn't fully confident in this classification">
              Low-confidence read ({Math.round(meta.confidence * 100)}%) — worth a second look
            </span>
          )}
        </div>
      )}

      <p className="mt-2 text-sm text-muted-foreground">
        {convo.summary || (handled ? "Answered — no summary generated." : "No summary yet.")}
      </p>

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
            <p className="text-sm text-muted-foreground">
              No messages recorded — this visitor started a chat but never sent one.
            </p>
          ) : (
            convo.transcript.map((m, i) => (
              <div key={i} className={cn("flex flex-col", m.role === "assistant" ? "items-start" : "items-end")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    m.role === "assistant" ? "bg-accent text-accent-foreground" : "bg-foreground text-background",
                  )}
                >
                  {m.role === "assistant" && <Sparkles className="mb-1 inline size-3 opacity-60" />}
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                <span className="mt-0.5 px-1 text-[0.65rem] text-muted-foreground">{messageTime(m.ts)}</span>
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
