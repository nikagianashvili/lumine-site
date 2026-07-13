import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ConversationCard } from "@/components/inbox/ConversationCard";
import { Skeleton } from "@/components/ui/skeleton";

export function InboxPage() {
  const convosQuery = useQuery({ queryKey: ["conversations"], queryFn: api.conversations.list });

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">AI Inbox</h1>
        <p className="text-sm text-muted-foreground">Every conversation Lumine AI has had with a visitor.</p>
      </div>

      {convosQuery.isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {convosQuery.isError && (
        <p className="text-sm text-destructive">Couldn't load conversations: {convosQuery.error.message}</p>
      )}

      {convosQuery.data && convosQuery.data.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No conversations yet — this fills in the moment a visitor messages you through the contact form or chat.
        </p>
      )}

      {convosQuery.data && convosQuery.data.length > 0 && (
        <div className="flex flex-col gap-3">
          {convosQuery.data.map((c) => (
            <ConversationCard key={c.id} convo={c} />
          ))}
        </div>
      )}
    </div>
  );
}
