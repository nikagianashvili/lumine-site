import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, Search, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/session";
import { api, type Client, type ClientStatus } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_OPTIONS: ClientStatus[] = ["new", "hot", "warm", "cold", "client", "lost"];
// rank + color both taken from the vanilla admin's css/admin.css mapping,
// not invented fresh - keeps the pipeline-stage vocabulary consistent
const STATUS_RANK: Record<ClientStatus, number> = { hot: 0, warm: 1, new: 2, client: 3, cold: 4, lost: 5 };
const STATUS_CLASSES: Record<ClientStatus, string> = {
  hot: "bg-destructive/10 text-destructive",
  warm: "bg-warning-tint text-warning",
  new: "bg-info-tint text-info",
  client: "bg-success-tint text-success",
  cold: "bg-muted text-muted-foreground",
  lost: "bg-muted text-muted-foreground",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

async function deleteClient(id: string) {
  const res = await adminFetch("/api/admin/clients", { method: "DELETE", body: JSON.stringify({ id }) });
  if (!res.ok) throw new Error((await res.json()).error || "Could not delete client");
}

export function ClientsTable() {
  const queryClient = useQueryClient();
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ClientStatus }) => api.clients.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["clients"] });
      const previous = queryClient.getQueryData<Client[]>(["clients"]);
      queryClient.setQueryData<Client[]>(["clients"], (old) =>
        (old ?? []).map((c) => (c.id === id ? { ...c, status } : c)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["clients"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortHeader label="Name" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        ),
        cell: (info) => <span className="font-medium">{(info.getValue() as string) || "—"}</span>,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: (info) => {
          const phone = info.getValue() as string | null;
          return phone ? (
            <a href={`tel:${phone}`} className="text-primary hover:underline">
              {phone}
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => {
          const email = info.getValue() as string | null;
          return email ? (
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {email}
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: (info) => <span className="text-muted-foreground">{(info.getValue() as string) || "—"}</span>,
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: (info) => <span className="text-muted-foreground">{(info.getValue() as string).replace("_", " ")}</span>,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortHeader label="Status" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        ),
        sortingFn: (a, b) => STATUS_RANK[a.original.status] - STATUS_RANK[b.original.status],
        cell: (info) => {
          const client = info.row.original;
          return (
            <Select
              value={client.status}
              onValueChange={(v) => statusMutation.mutate({ id: client.id, status: v as ClientStatus })}
            >
              <SelectTrigger
                className={`h-7 w-24 rounded-full border-none px-2.5 text-xs font-semibold uppercase shadow-none ${STATUS_CLASSES[client.status]}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <SortHeader label="Added" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        ),
        cell: (info) => <span className="tabular-nums text-muted-foreground">{formatDate(info.getValue() as string)}</span>,
      },
      {
        id: "actions",
        header: "",
        cell: (info) => (
          <button
            type="button"
            aria-label="Delete client"
            onClick={() => {
              if (window.confirm("Delete this client? This can't be undone.")) {
                deleteMutation.mutate(info.row.original.id);
              }
            }}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        ),
      },
    ],
    [statusMutation, deleteMutation],
  );

  const table = useReactTable({
    data: clientsQuery.data ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _col, value) => {
      const q = String(value).toLowerCase();
      const c = row.original;
      return [c.name, c.email, c.company].filter(Boolean).some((f) => f!.toLowerCase().includes(q));
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (clientsQuery.isLoading) return <Skeleton className="h-96" />;
  if (clientsQuery.isError) {
    return <p className="text-sm text-destructive">Couldn't load clients: {clientsQuery.error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  No clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortHeader({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 hover:text-foreground">
      {label}
      <ArrowUpDown className="size-3" />
    </button>
  );
}
