import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, SearchX } from "lucide-react";
import { api, type Conversation } from "@/lib/api";
import { ConversationCard } from "@/components/inbox/ConversationCard";
import { InboxToolbar, type InboxFilters } from "@/components/inbox/InboxToolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

const URGENCY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

function matchesSearch(c: Conversation, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  const haystack = [c.clients?.name, c.clients?.email, c.clients?.company, c.summary].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(q);
}

function sortConversations(list: Conversation[], sort: InboxFilters["sort"]) {
  const sorted = [...list];
  if (sort === "oldest") {
    sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (sort === "newest") {
    sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    // urgent: escalated conversations lead, then by AI-assessed urgency, then newest first
    sorted.sort((a, b) => {
      const aEscalated = a.status === "qualified" ? 0 : 1;
      const bEscalated = b.status === "qualified" ? 0 : 1;
      if (aEscalated !== bEscalated) return aEscalated - bEscalated;
      const aUrgency = URGENCY_RANK[a.clients?.meta.urgency ?? ""] ?? 3;
      const bUrgency = URGENCY_RANK[b.clients?.meta.urgency ?? ""] ?? 3;
      if (aUrgency !== bUrgency) return aUrgency - bUrgency;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }
  return sorted;
}

export function InboxPage() {
  const convosQuery = useQuery({ queryKey: ["conversations"], queryFn: api.conversations.list });
  const [filters, setFilters] = useState<InboxFilters>({
    search: "",
    convoStatus: "all",
    leadStatus: "all",
    sort: "urgent", // escalated conversations lead by default
  });

  const filtered = useMemo(() => {
    const data = convosQuery.data ?? [];
    const matched = data.filter((c) => {
      if (filters.convoStatus !== "all" && c.status !== filters.convoStatus) return false;
      if (filters.leadStatus !== "all" && c.clients?.status !== filters.leadStatus) return false;
      if (!matchesSearch(c, filters.search)) return false;
      return true;
    });
    return sortConversations(matched, filters.sort);
  }, [convosQuery.data, filters]);

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
        <ErrorState message={convosQuery.error.message} onRetry={() => convosQuery.refetch()} />
      )}

      {convosQuery.data && convosQuery.data.length === 0 && (
        <EmptyState
          icon={MessageSquare}
          title="Lumine AI is live — no conversations yet"
          description="It'll answer and qualify the moment someone messages through the contact form or chat."
        />
      )}

      {convosQuery.data && convosQuery.data.length > 0 && (
        <>
          <InboxToolbar filters={filters} onChange={(next) => setFilters((f) => ({ ...f, ...next }))} />

          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No conversations match these filters"
              description="Try widening the status filters or clearing the search."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((c) => (
                <ConversationCard key={c.id} convo={c} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
