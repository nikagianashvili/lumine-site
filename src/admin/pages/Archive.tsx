import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { PORTFOLIO_SERVICE_TYPES, INDUSTRIES } from "@/lib/portfolioTaxonomy";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectDetail } from "@/components/projects/ProjectDetail";

export function ArchivePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");

  const engagementsQuery = useQuery({ queryKey: ["engagements"], queryFn: api.engagements.list });
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });

  const clientsById = useMemo(
    () => new Map((clientsQuery.data ?? []).map((c) => [c.id, c])),
    [clientsQuery.data],
  );

  const completed = useMemo(
    () => (engagementsQuery.data ?? []).filter((p) => p.status === "completed"),
    [engagementsQuery.data],
  );

  const filtered = useMemo(() => {
    return completed.filter((p) => {
      if (serviceFilter !== "all" && p.service_type !== serviceFilter) return false;
      if (industryFilter !== "all" && p.industry !== industryFilter) return false;
      if (search) {
        const client = clientsById.get(p.client_id ?? "");
        const haystack = [p.title, client?.name, client?.company, p.industry].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [completed, serviceFilter, industryFilter, search, clientsById]);

  if (selectedId) {
    return <ProjectDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Archive</h1>
        <p className="text-sm text-muted-foreground">Completed work, searchable by client, service, and industry.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search archive…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {PORTFOLIO_SERVICE_TYPES.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All industries</SelectItem>
            {INDUSTRIES.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(engagementsQuery.isLoading || clientsQuery.isLoading || tasksQuery.isLoading) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      )}

      {engagementsQuery.data && filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {completed.length === 0
            ? "Nothing archived yet — mark a project's status as Completed to see it here."
            : "No archived work matches these filters."}
        </p>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const client = clientsById.get(p.client_id ?? "");
            return (
              <ProjectCard
                key={p.id}
                project={p}
                clientName={client?.name || client?.email || "No client linked"}
                tasks={(tasksQuery.data ?? []).filter((t) => t.engagement_id === p.id)}
                onClick={() => setSelectedId(p.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
