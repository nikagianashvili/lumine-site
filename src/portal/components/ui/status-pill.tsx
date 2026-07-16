import { cn } from "@portal/lib/utils";
import type { EngagementStatus, ApprovalStatus, TaskStatus } from "@portal/lib/api";

const ENGAGEMENT_STATUS_CLASSES: Record<EngagementStatus, string> = {
  active: "bg-success-tint text-success",
  on_hold: "bg-warning-tint text-warning",
  completed: "bg-info-tint text-info",
  cancelled: "bg-muted text-muted-foreground",
};

const ENGAGEMENT_STATUS_LABELS: Record<EngagementStatus, string> = {
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function EngagementStatusPill({ status, className }: { status: EngagementStatus; className?: string }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase", ENGAGEMENT_STATUS_CLASSES[status], className)}>
      {ENGAGEMENT_STATUS_LABELS[status]}
    </span>
  );
}

const APPROVAL_STATUS_CLASSES: Record<NonNullable<ApprovalStatus>, string> = {
  approved: "bg-success-tint text-success",
  changes_requested: "bg-warning-tint text-warning",
};

const APPROVAL_STATUS_LABELS: Record<NonNullable<ApprovalStatus>, string> = {
  approved: "Approved",
  changes_requested: "Changes Requested",
};

export function ApprovalStatusPill({ status, className }: { status: ApprovalStatus; className?: string }) {
  if (!status) {
    return <span className={cn("rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold uppercase text-muted-foreground", className)}>Awaiting Review</span>;
  }
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase", APPROVAL_STATUS_CLASSES[status], className)}>
      {APPROVAL_STATUS_LABELS[status]}
    </span>
  );
}

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "In Review",
  done: "Done",
};

export function TaskStatusPill({ status, className }: { status: TaskStatus; className?: string }) {
  const classes: Record<TaskStatus, string> = {
    todo: "bg-muted text-muted-foreground",
    in_progress: "bg-info-tint text-info",
    review: "bg-warning-tint text-warning",
    done: "bg-success-tint text-success",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase", classes[status], className)}>
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
