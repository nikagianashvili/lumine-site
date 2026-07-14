// Manual status a team member sets for themselves (Phase 7) - shown as a
// dot next to their avatar wherever one renders. Deliberately manual, not
// inferred from activity - "On Set" isn't something the system can detect.
export const TEAM_STATUSES = ["Available", "Focused", "On Set", "Away"] as const;

export type TeamStatus = (typeof TEAM_STATUSES)[number];

export const STATUS_COLOR: Record<string, string> = {
  Available: "bg-success",
  Focused: "bg-primary",
  "On Set": "bg-warning",
  Away: "bg-muted-foreground",
};
