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
import { ArrowUpDown, Search } from "lucide-react";
import { api, type Task, type TaskPriority, type TaskStatus, type TeamMember } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const SERVICE_LABELS: Record<string, string> = {
  web: "Web Development",
  "photo-video": "Photo & Video",
  design: "Graphic Design",
};

const PRIORITY_VARIANT = { low: "success", medium: "warning", high: "destructive" } as const;
// default string sort is alphabetical, which reads wrong for both of these
// (alphabetical priority: high, low, medium; alphabetical status: done,
// in_progress, review, todo) - rank by actual severity/workflow order
const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
const STATUS_RANK: Record<TaskStatus, number> = { todo: 0, in_progress: 1, review: 2, done: 3 };
const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Not Started",
  in_progress: "In Progress",
  review: "Under Review",
  done: "Completed",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function Spreadsheet() {
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) => api.tasks.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, ...updates } : t)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const teamMembers = teamQuery.data ?? [];
  const teamById = useMemo(() => new Map(teamMembers.map((m) => [m.id, m])), [teamMembers]);

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <SortHeader label="Title" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        ),
        cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "service_type",
        header: "Category",
        cell: (info) => {
          const v = info.getValue() as string | null;
          return <span className="text-muted-foreground">{v ? SERVICE_LABELS[v] || v : "General"}</span>;
        },
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <SortHeader label="Priority" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        ),
        // default string sort is alphabetical (high, low, medium) which
        // reads wrong for a severity column - rank by actual severity
        sortingFn: (a, b) => PRIORITY_RANK[a.original.priority] - PRIORITY_RANK[b.original.priority],
        cell: (info) => {
          const task = info.row.original;
          return (
            <Select
              value={task.priority}
              onValueChange={(v) => updateMutation.mutate({ id: task.id, updates: { priority: v as TaskPriority } })}
            >
              <SelectTrigger className="h-7 w-28 border-none bg-transparent px-0 shadow-none">
                <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortHeader label="Status" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        ),
        sortingFn: (a, b) => STATUS_RANK[a.original.status] - STATUS_RANK[b.original.status],
        cell: (info) => {
          const task = info.row.original;
          return (
            <Select
              value={task.status}
              onValueChange={(v) => updateMutation.mutate({ id: task.id, updates: { status: v as TaskStatus } })}
            >
              <SelectTrigger className="h-7 w-32 border-none bg-transparent px-0 shadow-none">
                <SelectValue>{STATUS_LABELS[task.status]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "due_date",
        header: ({ column }) => (
          <SortHeader label="Due" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        ),
        cell: (info) => <span className="tabular-nums text-muted-foreground">{formatDate(info.getValue() as string | null)}</span>,
      },
      {
        accessorKey: "assignee",
        header: "Assignee",
        cell: (info) => {
          const id = info.getValue() as string | null;
          const member: TeamMember | undefined = id ? teamById.get(id) : undefined;
          return <span className="text-muted-foreground">{member?.name || "Unassigned"}</span>;
        },
      },
    ],
    [teamById, updateMutation],
  );

  const table = useReactTable({
    data: tasksQuery.data ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _col, value) => row.original.title.toLowerCase().includes(String(value).toLowerCase()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (tasksQuery.isLoading || teamQuery.isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (tasksQuery.isError) {
    return <p className="text-sm text-destructive">Couldn't load tasks: {tasksQuery.error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search titles…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-border bg-card">
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
                  No tasks match.
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
