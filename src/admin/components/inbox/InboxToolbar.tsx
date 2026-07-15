import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClientStatus, ConversationStatus } from "@/lib/api";

export type SortMode = "newest" | "oldest" | "urgent";

const CONVO_STATUSES: (ConversationStatus | "all")[] = ["all", "open", "qualified", "closed"];
// "qualified" renders as "Needs you" — the card pill, the Overview summary,
// and this filter must all use the same words for the same state
const CONVO_LABELS: Record<ConversationStatus | "all", string> = {
  all: "All conversations",
  open: "Open",
  qualified: "Needs you",
  closed: "Closed",
};

const LEAD_STATUSES: (ClientStatus | "all")[] = ["all", "hot", "warm", "new", "client", "cold", "lost"];

const SORT_LABELS: Record<SortMode, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  urgent: "Most urgent first",
};

export interface InboxFilters {
  search: string;
  convoStatus: ConversationStatus | "all";
  leadStatus: ClientStatus | "all";
  sort: SortMode;
}

export function InboxToolbar({
  filters,
  onChange,
}: {
  filters: InboxFilters;
  onChange: (next: Partial<InboxFilters>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-64 flex-shrink-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search name, email, company, summary…"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="pl-8"
        />
      </div>

      <Select value={filters.convoStatus} onValueChange={(v) => onChange({ convoStatus: v as ConversationStatus | "all" })}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CONVO_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {CONVO_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.leadStatus} onValueChange={(v) => onChange({ leadStatus: v as ClientStatus | "all" })}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All leads</SelectItem>
          {LEAD_STATUSES.filter((s) => s !== "all").map((s) => (
            <SelectItem key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.sort} onValueChange={(v) => onChange({ sort: v as SortMode })}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(SORT_LABELS) as SortMode[]).map((s) => (
            <SelectItem key={s} value={s}>
              {SORT_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
