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
import { Search, AlarmClock, CalendarClock, UserX, Flame, X } from "lucide-react";
import { api, type Task, type TaskPriority, type TaskStatus, type TeamMember } from "@/lib/api";
import { SERVICE_TYPES, SERVICE_LABELS } from "@/lib/serviceTypes";
import { PRIORITY_VARIANT, TASK_STATUS_LABELS } from "@/lib/taskMeta";
import { formatDateFull } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SortHeader, ariaSort } from "@/components/ui/sort-header";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

// default string sort is alphabetical, which reads wrong for both of these
// (alphabetical priority: high, low, medium; alphabetical status: done,
// in_progress, review, todo) - rank by actual severity/workflow order
const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
const STATUS_RANK: Record<TaskStatus, number> = { todo: 0, in_progress: 1, review: 2, done: 3 };

type DueFilter = "all" | "overdue" | "today" | "week" | "no-date";

function dueBucket(task: Task): Exclude<DueFilter, "all"> | null {
  if (!task.due_date) return "no-date";
  const due = new Date(task.due_date);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dueDay - today.getTime()) / 86400000);
  if (diffDays < 0 && task.status !== "done") return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays > 0 && diffDays <= 7) return "week";
  return null;
}

// One-tap shortcuts into the most common daily-triage questions, on top of
// the exact dropdown filters below - "what's on fire right now" shouldn't
// need three menus.
const QUICK_FILTERS = [
  { key: "overdue", label: "Overdue", icon: AlarmClock },
  { key: "today", label: "Due today", icon: CalendarClock },
  { key: "unassigned", label: "Unassigned", icon: UserX },
  { key: "high", label: "High priority", icon: Flame },
] as const;
type QuickFilterKey = (typeof QUICK_FILTERS)[number]["key"];

// least-essential columns drop out first as the screen narrows, so the
// table reads without horizontal scroll-hunting on smaller screens
type ColumnMeta = { className?: string };

export function Spreadsheet() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  const engagementsQuery = useQuery({ queryKey: ["engagements"], queryFn: api.engagements.list });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | "unassigned" | string>("all");
  const [serviceFilter, setServiceFilter] = useState<"all" | string>("all");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");

  function toggleQuickFilter(key: QuickFilterKey) {
    if (key === "overdue") setDueFilter((f) => (f === "overdue" ? "all" : "overdue"));
    if (key === "today") setDueFilter((f) => (f === "today" ? "all" : "today"));
    if (key === "unassigned") setAssigneeFilter((f) => (f === "unassigned" ? "all" : "unassigned"));
    if (key === "high") setPriorityFilter((f) => (f === "high" ? "all" : "high"));
  }
  const isQuickFilterActive = (key: QuickFilterKey) =>
    (key === "overdue" && dueFilter === "overdue") ||
    (key === "today" && dueFilter === "today") ||
    (key === "unassigned" && assigneeFilter === "unassigned") ||
    (key === "high" && priorityFilter === "high");

  const hasActiveFilters =
    statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all" || serviceFilter !== "all" || dueFilter !== "all";
  function clearFilters() {
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setServiceFilter("all");
    setDueFilter("all");
  }

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
    onError: (err: Error, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
      toast({ title: "Couldn't update task", description: err.message, variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const teamMembers = teamQuery.data ?? [];
  const teamById = useMemo(() => new Map(teamMembers.map((m) => [m.id, m])), [teamMembers]);
  const engagements = engagementsQuery.data ?? [];
  const engagementsById = useMemo(() => new Map(engagements.map((p) => [p.id, p])), [engagements]);

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <SortHeader label="Title" sorted={column.getIsSorted()} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        ),
        cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "engagement_id",
        header: "Project",
        meta: { className: "hidden md:table-cell" } as ColumnMeta,
        cell: (info) => {
          const id = info.getValue() as string | null;
          const project = id ? engagementsById.get(id) : undefined;
          return <span className="text-muted-foreground">{project?.title || "—"}</span>;
        },
      },
      {
        accessorKey: "service_type",
        header: "Category",
        meta: { className: "hidden lg:table-cell" } as ColumnMeta,
        cell: (info) => {
          const v = info.getValue() as string | null;
          return <span className="text-muted-foreground">{v ? SERVICE_LABELS[v] || v : "General"}</span>;
        },
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <SortHeader label="Priority" sorted={column.getIsSorted()} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
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
          <SortHeader label="Status" sorted={column.getIsSorted()} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
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
                <SelectValue>{TASK_STATUS_LABELS[task.status]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {TASK_STATUS_LABELS[s]}
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
          <SortHeader label="Due" sorted={column.getIsSorted()} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        ),
        cell: (info) => <span className="tabular-nums text-muted-foreground">{formatDateFull(info.getValue() as string | null)}</span>,
      },
      {
        accessorKey: "assignee",
        header: "Assignee",
        meta: { className: "hidden sm:table-cell" } as ColumnMeta,
        cell: (info) => {
          const id = info.getValue() as string | null;
          const member: TeamMember | undefined = id ? teamById.get(id) : undefined;
          return <span className="text-muted-foreground">{member?.name || "Unassigned"}</span>;
        },
      },
    ],
    [teamById, engagementsById, updateMutation],
  );

  const filteredData = useMemo(() => {
    return (tasksQuery.data ?? []).filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (assigneeFilter === "unassigned" && t.assignee) return false;
      if (assigneeFilter !== "all" && assigneeFilter !== "unassigned" && t.assignee !== assigneeFilter) return false;
      if (serviceFilter !== "all" && (t.service_type || "") !== serviceFilter) return false;
      if (dueFilter !== "all" && dueBucket(t) !== dueFilter) return false;
      return true;
    });
  }, [tasksQuery.data, statusFilter, priorityFilter, assigneeFilter, serviceFilter, dueFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _col, value) => row.original.title.toLowerCase().includes(String(value).toLowerCase()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (tasksQuery.isLoading || teamQuery.isLoading || engagementsQuery.isLoading) {
    // mirrors the loaded layout: search field, then the table card
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (tasksQuery.isError) {
    return <ErrorState message={tasksQuery.error.message} onRetry={() => tasksQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search titles…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        {QUICK_FILTERS.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            type="button"
            variant={isQuickFilterActive(key) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleQuickFilter(key)}
          >
            <Icon className="size-3.5" />
            {label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {teamMembers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name || m.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {SERVICE_TYPES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dueFilter} onValueChange={(v) => setDueFilter(v as DueFilter)}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Due" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any due date</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="today">Due today</SelectItem>
            <SelectItem value="week">Due this week</SelectItem>
            <SelectItem value="no-date">No due date</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-3.5" />
            Clear filters
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {table.getRowModel().rows.length} of {tasksQuery.data?.length ?? 0} tasks
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-border bg-card">
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
                <td colSpan={columns.length} className="px-4 py-10">
                  <EmptyState
                    icon={Search}
                    title="No tasks match"
                    description={
                      hasActiveFilters || globalFilter
                        ? "Try widening a filter or clearing the search."
                        : "Nothing here yet."
                    }
                    action={
                      hasActiveFilters ? (
                        <Button size="sm" variant="outline" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
