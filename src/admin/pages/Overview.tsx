import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { LayoutGrid, Eye, RotateCcw, Check } from "lucide-react";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { useDashboardLayout, WIDGET_LABELS, WIDGET_SPAN, type WidgetId } from "@/lib/dashboardLayout";
import { HighlightsCard } from "@/components/overview/HighlightsCard";
import { LeadsChart, type DayCount } from "@/components/overview/LeadsChart";
import { SourceBreakdown } from "@/components/overview/SourceBreakdown";
import { ActivityFeed } from "@/components/overview/ActivityFeed";
import { MyQueue } from "@/components/overview/MyQueue";
import { InboxSummary } from "@/components/overview/InboxSummary";
import { SortableWidget } from "@/components/overview/SortableWidget";
import { WidgetChrome } from "@/components/overview/WidgetChrome";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

const DAY_MS = 24 * 60 * 60 * 1000;

// Specialty label on team_members.role -> which Overview variant they see.
// Free text, no permissions attached - anything unrecognized (including
// "Founder") falls through to the full agency-wide view below.
type Variant = "orchestrator" | "media" | "design" | "full";

function variantFor(role: string | undefined) {
  switch ((role || "").toLowerCase()) {
    case "orchestrator":
      return "orchestrator" as Variant;
    case "media":
      return "media" as Variant;
    case "design":
      return "design" as Variant;
    default:
      return "full" as Variant;
  }
}

// One deliberate motion moment on this dashboard, not scattered everywhere:
// the stat cards stagger in on load. staggerChildren is skipped entirely
// under reduced-motion rather than just shortened, so nothing moves.
const STAGGER_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function OverviewPage() {
  const reduceMotion = useReducedMotion();
  const [editingLayout, setEditingLayout] = useState(false);
  const layout = useDashboardLayout();
  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const session = getSession();
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: api.tasks.list });
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  const convosQuery = useQuery({ queryKey: ["conversations"], queryFn: api.conversations.list });

  if (clientsQuery.isLoading || tasksQuery.isLoading) {
    // mirrors the loaded page: greeting block, highlight cards, chart row
    return (
      <div className="flex flex-col gap-5 pt-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Skeleton className="h-72 rounded-xl lg:col-span-3" />
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (clientsQuery.isError || tasksQuery.isError) {
    const failed = clientsQuery.isError ? clientsQuery : tasksQuery;
    return (
      <div className="pt-6">
        <ErrorState
          title="Couldn't load the dashboard"
          message={failed.error?.message}
          onRetry={() => {
            clientsQuery.refetch();
            tasksQuery.refetch();
          }}
        />
      </div>
    );
  }

  const clients = clientsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const me = teamQuery.data?.find((m) => m.id === session?.user.id);
  const variant = variantFor(me?.role);
  const myTasks = tasks.filter((t) => t.assignee === session?.user.id);
  const myClients = clients.filter((c) => c.assigned_to === session?.user.id);

  const now = Date.now();
  const weekAgo = now - 7 * DAY_MS;
  const leadsThisWeek = clients.filter((c) => new Date(c.created_at).getTime() >= weekAgo).length;
  const hotLeads = clients.filter((c) => c.status === "hot").length;
  const booked = clients.filter((c) => c.status === "client").length;
  const aiQualified = clients.filter((c) => c.source === "ai_chat" || c.source === "ai_consultant").length;

  const days: DayCount[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * DAY_MS);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + DAY_MS;
    const count = clients.filter((c) => {
      const t = new Date(c.created_at).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    return { date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count };
  });

  const sourceCounts = clients.reduce<Record<string, number>>((acc, c) => {
    acc[c.source] = (acc[c.source] || 0) + 1;
    return acc;
  }, {});

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);
  const recentMyClients = [...myClients]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const firstName = me?.name?.trim().split(/\s+/)[0];

  // Two Highlights widgets (Metronic's stat-card pattern: headline number +
  // badge, segmented proportion bar, divider, icon-dot breakdown rows) - one
  // for the lead pipeline, one for the task pipeline. Every value and every
  // segment weight comes from real data, no fabricated trend arrows.
  const leadSegments = [
    { key: "contact_form", color: "var(--chart-contact-form)", weight: sourceCounts.contact_form || 0 },
    { key: "manual", color: "var(--chart-manual)", weight: sourceCounts.manual || 0 },
    { key: "ai_chat", color: "var(--chart-ai-chat)", weight: sourceCounts.ai_chat || 0 },
    { key: "ai_consultant", color: "var(--chart-ai-consultant)", weight: sourceCounts.ai_consultant || 0 },
  ];
  const leadRows = [
    { key: "hot", label: "Hot leads", value: hotLeads, color: "var(--color-destructive)" },
    { key: "booked", label: "Booked", value: booked, color: "var(--color-success)" },
    { key: "ai", label: "AI-qualified", value: aiQualified, color: "var(--color-primary)" },
  ];

  const todo = tasks.filter((t) => t.status === "todo").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const review = tasks.filter((t) => t.status === "review").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const openTasks = todo + inProgress + review;
  const taskSegments = [
    { key: "todo", color: "var(--color-muted-foreground)", weight: todo },
    { key: "in_progress", color: "var(--color-info)", weight: inProgress },
    { key: "review", color: "var(--color-warning)", weight: review },
    { key: "done", color: "var(--color-success)", weight: done },
  ];
  const taskRows = [
    { key: "todo", label: "Not started", value: todo, color: "var(--color-muted-foreground)" },
    { key: "in_progress", label: "In progress", value: inProgress, color: "var(--color-info)" },
    { key: "review", label: "Under review", value: review, color: "var(--color-warning)" },
  ];

  function renderWidget(id: WidgetId) {
    switch (id) {
      case "leads-highlights":
        return (
          <HighlightsCard
            title="Leads"
            value={leadsThisWeek}
            badge={hotLeads > 0 ? `${hotLeads} hot` : undefined}
            segments={leadSegments}
            rows={leadRows}
          />
        );
      case "tasks-highlights":
        return (
          <HighlightsCard
            title="Tasks"
            value={openTasks}
            badge={done > 0 ? `${done} done` : undefined}
            segments={taskSegments}
            rows={taskRows}
          />
        );
      case "leads-chart":
        return <LeadsChart data={days} />;
      case "source-breakdown":
        return <SourceBreakdown counts={sourceCounts} />;
      case "activity-feed":
        return <ActivityFeed clients={recentClients} tasks={recentTasks} />;
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = layout.order.indexOf(active.id as WidgetId);
    const newIndex = layout.order.indexOf(over.id as WidgetId);
    layout.setOrder(arrayMove(layout.order, oldIndex, newIndex));
  }

  const allHiddenWidgets = (Object.keys(WIDGET_LABELS) as WidgetId[]).filter((id) => layout.isHidden(id));

  return (
    <div className="flex flex-col gap-5 pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Here's what's moved since you last checked in.</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden shrink-0 text-sm text-muted-foreground sm:block">
            {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </p>
          {variant === "full" && (
            <div className="flex items-center gap-2">
              {editingLayout && allHiddenWidgets.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="size-3.5" />
                      Add widget
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Hidden widgets</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allHiddenWidgets.map((id) => (
                      <DropdownMenuItem key={id} onClick={() => layout.toggleWidget(id)}>
                        {WIDGET_LABELS[id]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {editingLayout && (
                <Button variant="outline" size="sm" onClick={() => layout.reset()}>
                  <RotateCcw className="size-3.5" />
                  Reset
                </Button>
              )}
              <Button
                variant={editingLayout ? "default" : "outline"}
                size="sm"
                onClick={() => setEditingLayout((v) => !v)}
              >
                {editingLayout ? <Check className="size-3.5" /> : <LayoutGrid className="size-3.5" />}
                {editingLayout ? "Done" : "Customize"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {variant === "full" && (
        <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={layout.order} strategy={rectSortingStrategy}>
            <motion.div
              className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2"
              initial={reduceMotion ? false : "hidden"}
              animate="show"
              variants={STAGGER_CONTAINER}
            >
              {layout.order
                .filter((id) => !layout.isHidden(id))
                .map((id) => (
                  <motion.div
                    key={id}
                    variants={STAGGER_ITEM}
                    className={cn(WIDGET_SPAN[id] === 2 && "sm:col-span-2")}
                  >
                    <SortableWidget id={id} editing={editingLayout}>
                      <WidgetChrome editing={editingLayout} onHide={() => layout.toggleWidget(id)}>
                        {renderWidget(id)}
                      </WidgetChrome>
                    </SortableWidget>
                  </motion.div>
                ))}
            </motion.div>
          </SortableContext>
        </DndContext>
      )}

      {variant !== "full" && (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={STAGGER_CONTAINER}
        >
          <motion.div variants={STAGGER_ITEM}>{renderWidget("leads-highlights")}</motion.div>
          <motion.div variants={STAGGER_ITEM}>{renderWidget("tasks-highlights")}</motion.div>
        </motion.div>
      )}

      {variant === "orchestrator" && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <LeadsChart data={days} />
            </div>
            <div className="lg:col-span-2">
              <SourceBreakdown counts={sourceCounts} />
            </div>
          </div>
          <InboxSummary conversations={convosQuery.data ?? []} />
          <ActivityFeed clients={recentMyClients} tasks={[]} />
        </>
      )}

      {variant === "media" && <MyQueue tasks={myTasks} title="Shoot schedule" />}
      {variant === "design" && <MyQueue tasks={myTasks} title="Design queue" />}
    </div>
  );
}
