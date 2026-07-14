import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "@/lib/api";

const URGENCY_VARIANT: Record<string, "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function InboxSummary({ conversations }: { conversations: Conversation[] }) {
  const escalated = conversations.filter((c) => c.status === "qualified").length;
  const open = conversations.filter((c) => c.status === "open").length;
  const recent = [...conversations]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI Inbox</CardTitle>
        <span className="text-xs text-muted-foreground">
          {escalated} escalated · {open} open
        </span>
      </CardHeader>
      <div className="flex flex-col gap-1 px-5 pb-5">
        {recent.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">No conversations yet.</p>
        ) : (
          recent.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
              <span className="flex-1 truncate">{c.clients?.name || c.clients?.email || "Unnamed visitor"}</span>
              {c.clients?.meta.urgency && (
                <Badge variant={URGENCY_VARIANT[c.clients.meta.urgency] ?? "secondary"}>
                  {c.clients.meta.urgency}
                </Badge>
              )}
              {c.status === "qualified" && <Badge variant="destructive">escalated</Badge>}
              <span className="flex-shrink-0 text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
