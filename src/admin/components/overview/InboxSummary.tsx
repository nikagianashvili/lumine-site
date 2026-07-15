import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/format";
import type { Conversation } from "@/lib/api";

const URGENCY_VARIANT: Record<string, "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

export function InboxSummary({ conversations }: { conversations: Conversation[] }) {
  const needsYou = conversations.filter((c) => c.status === "qualified").length;
  const open = conversations.filter((c) => c.status === "open").length;
  const recent = [...conversations]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI Inbox</CardTitle>
        <span className="text-xs text-muted-foreground">
          {needsYou} need you · {open} open
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
              {c.status === "qualified" && <Badge variant="destructive">Needs you</Badge>}
              <span className="flex-shrink-0 text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
