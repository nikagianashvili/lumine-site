import type { TaskPriority, TaskStatus } from "./api";

// Single source for how a task's status and priority render — the labels
// existed in 4 copies (BoardColumn/MyQueue/Spreadsheet/ProjectBoard) and
// the priority→badge mapping in 3, guaranteed to drift eventually.
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Not Started",
  in_progress: "In Progress",
  review: "Under Review",
  done: "Completed",
};

export const PRIORITY_VARIANT: Record<TaskPriority, "success" | "warning" | "destructive"> = {
  low: "success",
  medium: "warning",
  high: "destructive",
};
