import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { api, type EngagementStatus } from "@/lib/api";
import { SERVICE_TYPES } from "@/lib/serviceTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { useDeepLink } from "@/lib/deepLink";

export function ProjectsPage() {
  const reduceMotion = useReducedMotion();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useDeepLink("projects", (target) => setSelectedId(target.engagementId));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EngagementStatus | "all">("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const engagementsQuery = useQuery({ queryKey: ["engagements"], queryFn: api.engagements.list });
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });

  const clientsById = useMemo(
    () => new Map((clientsQuery.data ?? []).map((c) => [c.id, c])),
    [clientsQuery.data],
  );

  const filtered = useMemo(() => {
    const list = engagementsQuery.data ?? [];
    return list.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (serviceFilter !== "all" && p.service_type !== serviceFilter) return false;
      if (search) {
        const client = clientsById.get(p.client_id ?? "");
        const haystack = [p.title, client?.name, client?.company].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [engagementsQuery.data, statusFilter, serviceFilter, search, clientsById]);

  if (selectedId) {
    return <ProjectDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">Real, paid work — one card per client engagement.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EngagementStatus | "all")}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {SERVICE_TYPES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
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

      {engagementsQuery.isError && (
        <p className="text-sm text-destructive">Couldn't load projects: {engagementsQuery.error.message}</p>
      )}

      {engagementsQuery.data && filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {engagementsQuery.data.length === 0
            ? "No projects yet — create the first one."
            : "No projects match these filters."}
        </p>
      )}

      {filtered.length > 0 && (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        >
          {filtered.map((p) => {
            const client = clientsById.get(p.client_id ?? "");
            return (
              <motion.div
                key={p.id}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProjectCard
                  project={p}
                  clientName={client?.name || client?.email || "No client linked"}
                  tasks={(tasksQuery.data ?? []).filter((t) => t.engagement_id === p.id)}
                  onClick={() => setSelectedId(p.id)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <NewProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
