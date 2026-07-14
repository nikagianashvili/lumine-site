// Shared with engagements (a project's service line) and tasks
// (denormalized from the project it belongs to, for fast Board/Spreadsheet
// filtering without a join) - one vocabulary, not duplicated per component.
export const SERVICE_TYPES = [
  { value: "web", label: "Web Development" },
  { value: "photo-video", label: "Photo & Video" },
  { value: "design", label: "Graphic Design" },
  { value: "smm", label: "Social Media Management" },
] as const;

export const SERVICE_LABELS: Record<string, string> = Object.fromEntries(
  SERVICE_TYPES.map((s) => [s.value, s.label]),
);
