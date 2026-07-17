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
import { Search, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/session";
import { api, type Client, type ClientStatus, type TeamMember } from "@/lib/api";
import { formatDateFull } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { CLIENT_STATUS_CLASSES } from "@/components/ui/status-pill";
import { SortHeader, ariaSort } from "@/components/ui/sort-header";

const STATUS_OPTIONS: ClientStatus[] = ["new", "hot", "warm", "cold", "client", "lost"];
// rank taken from the vanilla admin's css/admin.css mapping, not invented
// fresh - keeps the pipeline-stage vocabulary consistent
const STATUS_RANK: Record<ClientStatus, number> = { hot: 0, warm: 1, new: 2, client: 3, cold: 4, lost: 5 };

// least-essential columns drop out first as the screen narrows, same
// pattern as Spreadsheet.tsx
type ColumnMeta = { className?: string };

async function deleteClient(id: string) {
  const res = await adminFetch("/api/admin/clients", { method: "DELETE", body: JSON.stringify({ id }) });
  if (!res.ok) throw new Error((await res.json()).error || "Could not delete client");
}

export function ClientsTable({ onSelect }: { onSelect: (id: string) => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

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
    onError: (err: Error, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["clients"], ctx.previous);
      toast({ title: "Couldn't update status", description: err.message, variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, assigned_to }: { id: string; assigned_to: string | null }) =>
      api.clients.update(id, { assigned_to }),
    onMutate: async ({ id, assigned_to }) => {
      await queryClient.cancelQueries({ queryKey: ["clients"] });
      const previous = queryClient.getQueryData<Client[]>(["clients"]);
      queryClient.setQueryData<Client[]>(["clients"], (old) =>
        (old ?? []).map((c) => (c.id === id ? { ...c, assigned_to } : c)),
      );
      return { previous };
    },
    onError: (err: Error, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["clients"], ctx.previous);
      toast({ title: "Couldn't reassign client", description: err.message, variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast({ title: "Couldn't delete client", description: err.message, variant: "destructive" }),
  });

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortHeader label="Name" sorted={column.getIsSorted()} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        ),
        cell: (info) => {
          const client = info.row.original;
          return (
            <button
              type="button"
              onClick={() => onSelect(client.id)}
              className="font-medium text-left hover:text-primary hover:underline"
            >
              {client.name || "—"}
            </button>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Phone",
        meta: { className: "hidden sm:table-cell" } as ColumnMeta,
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
        meta: { className: "hidden md:table-cell" } as ColumnMeta,
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
        meta: { className: "hidden lg:table-cell" } as ColumnMeta,
        cell: (info) => <span className="text-muted-foreground">{(info.getValue() as string) || "—"}</span>,
      },
      {
        accessorKey: "source",
        header: "Source",
        meta: { className: "hidden lg:table-cell" } as ColumnMeta,
        cell: (info) => <span className="text-muted-foreground">{(info.getValue() as string).replace("_", " ")}</span>,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortHeader label="Status" sorted={column.getIsSorted()} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
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
                className={`h-7 w-24 rounded-full border-none px-2.5 text-xs font-semibold uppercase shadow-none ${CLIENT_STATUS_CLASSES[client.status]}`}
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
        accessorKey: "assigned_to",
        header: "Assigned to",
        meta: { className: "hidden md:table-cell" } as ColumnMeta,
        cell: (info) => {
          const client = info.row.original;
          return (
            <Select
              value={client.assigned_to ?? "unassigned"}
              onValueChange={(v) =>
                assignMutation.mutate({ id: client.id, assigned_to: v === "unassigned" ? null : v })
              }
            >
              <SelectTrigger className="h-7 w-32 border-none bg-transparent px-2 text-xs shadow-none">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {(teamQuery.data ?? []).map((m: TeamMember) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name || "Unnamed"}
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
          <SortHeader label="Added" sorted={column.getIsSorted()} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        ),
        meta: { className: "hidden sm:table-cell" } as ColumnMeta,
        cell: (info) => <span className="tabular-nums text-muted-foreground">{formatDateFull(info.getValue() as string)}</span>,
      },
      {
        id: "actions",
        header: "",
        cell: (info) => (
          <button
            type="button"
            aria-label="Delete client"
            onClick={() => setDeleteTarget(info.row.original)}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        ),
      },
    ],
    [statusMutation, assignMutation, teamQuery.data, onSelect],
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
    return <ErrorState message={clientsQuery.error.message} onRetry={() => clientsQuery.refetch()} />;
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
                  <th
                    key={header.id}
                    aria-sort={ariaSort(header.column.getIsSorted())}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground",
                      (header.column.columnDef.meta as ColumnMeta | undefined)?.className,
                    )}
                  >
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
                  <td
                    key={cell.id}
                    className={cn("px-4 py-2.5", (cell.column.columnDef.meta as ColumnMeta | undefined)?.className)}
                  >
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
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this client?"
        description={`${deleteTarget?.name || "This client"} will be permanently removed. This can't be undone.`}
        confirmLabel="Delete client"
        pending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
