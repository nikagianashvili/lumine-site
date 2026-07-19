import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Invoices/contracts, tied to a client - not creative project work (that's
// Folders). Global cross-client view here; ClientDetail shows the same
// data scoped to one client.
export function DocumentsPage() {
  const reduceMotion = useReducedMotion();
  const [clientFilter, setClientFilter] = useState<string>("all");
  const filesQuery = useQuery({ queryKey: ["files", "documents-all"], queryFn: () => api.files.list({ category: "document" }) });
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });

  const clientsById = useMemo(() => new Map((clientsQuery.data ?? []).map((c) => [c.id, c])), [clientsQuery.data]);

  const filtered = useMemo(() => {
    const files = filesQuery.data ?? [];
    if (clientFilter === "all") return files;
    return files.filter((f) => f.client_id === clientFilter);
  }, [filesQuery.data, clientFilter]);

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Documents</h1>
        <p className="text-sm text-muted-foreground">Invoices and contracts, on file per client.</p>
      </div>

      <Select value={clientFilter} onValueChange={setClientFilter}>
        <SelectTrigger className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All clients</SelectItem>
          {(clientsQuery.data ?? []).map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name || c.email || "Unnamed"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card>
        <CardHeader>
          <CardTitle>On file</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5">
          {filesQuery.isLoading ? (
            <Skeleton className="h-24" />
          ) : filesQuery.isError ? (
            <p className="py-6 text-sm text-muted-foreground">Document storage isn't set up yet.</p>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No documents on file yet.</p>
          ) : (
            <motion.div
              className="flex flex-col gap-1"
              initial={reduceMotion ? false : "hidden"}
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
            >
              {filtered.map((f) => {
                const client = clientsById.get(f.client_id ?? "");
                return (
                  <motion.div
                    key={f.id}
                    variants={{ hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0 } }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm"
                  >
                    {f.url ? (
                      <a href={f.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-primary hover:underline">
                        {f.name}
                      </a>
                    ) : (
                      <span className="flex-1 truncate">{f.name}</span>
                    )}
                    <span className="w-40 truncate text-xs text-muted-foreground">
                      {client?.name || client?.email || "—"}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
}

