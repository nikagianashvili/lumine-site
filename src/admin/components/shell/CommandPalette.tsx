import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Briefcase, CheckSquare, BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import type { DeepLinkTarget } from "@/lib/deepLink";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Result {
  key: string;
  title: string;
  subtitle: string;
  icon: typeof Users;
  target: DeepLinkTarget;
}

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (target: DeepLinkTarget) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Only fetch once the palette is actually open - but reuse the exact same
  // query keys the real pages use, so opening the palette after visiting a
  // page is instant (shared cache) instead of a fresh round trip.
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list, enabled: open });
  const engagementsQuery = useQuery({ queryKey: ["engagements"], queryFn: api.engagements.list, enabled: open });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list, enabled: open });
  const playbookQuery = useQuery({ queryKey: ["playbook"], queryFn: api.playbook.list, enabled: open });

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: Result[] = [];

    for (const c of clientsQuery.data ?? []) {
      const haystack = [c.name, c.email, c.company, c.notes].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(q)) {
        out.push({
          key: `client-${c.id}`,
          title: c.name || c.email || "Untitled client",
          subtitle: [c.company, c.email].filter(Boolean).join(" · ") || "Client",
          icon: Users,
          target: { page: "manage", clientId: c.id },
        });
      }
    }
    for (const e of engagementsQuery.data ?? []) {
      const haystack = [e.title, e.notes].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(q)) {
        out.push({
          key: `engagement-${e.id}`,
          title: e.title,
          subtitle: "Project",
          icon: Briefcase,
          target: { page: "projects", engagementId: e.id },
        });
      }
    }
    for (const t of tasksQuery.data ?? []) {
      const haystack = [t.title, t.description].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(q)) {
        out.push({
          key: `task-${t.id}`,
          title: t.title,
          subtitle: "Task",
          icon: CheckSquare,
          target: { page: "program", taskQuery: t.title },
        });
      }
    }
    for (const p of playbookQuery.data ?? []) {
      const haystack = [p.title, p.body].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(q)) {
        out.push({
          key: `playbook-${p.id}`,
          title: p.title,
          subtitle: "Playbook",
          icon: BookOpen,
          target: { page: "playbook", playbookId: p.id },
        });
      }
    }
    return out.slice(0, 20);
  }, [query, clientsQuery.data, engagementsQuery.data, tasksQuery.data, playbookQuery.data]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function select(result: Result) {
    onNavigate(result.target);
    onOpenChange(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[activeIndex];
      if (r) select(r);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent open={open} className="max-w-xl gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search clients, projects, tasks, and the playbook.</DialogDescription>
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search clients, projects, tasks, playbook…"
            className="h-12 flex-1 bg-transparent pr-8 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === "" && (
            <p className="p-6 text-center text-sm text-muted-foreground">Start typing to search everything.</p>
          )}
          {query.trim() !== "" && results.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">No matches for "{query}".</p>
          )}
          {results.map((r, i) => (
            <button
              key={r.key}
              type="button"
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => select(r)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                i === activeIndex ? "bg-muted" : "hover:bg-muted/60",
              )}
            >
              <r.icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{r.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{r.subtitle}</span>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
