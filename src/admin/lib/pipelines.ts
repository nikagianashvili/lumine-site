import type { TaskStatus } from "./api";

// Per-service Kanban stages, replacing the generic 4-column board within a
// project. Each stage also maps to one of the four universal task statuses
// (todo/in_progress/review/done) so cross-project views - Overview stats,
// progress bars, the global Program board - stay meaningful without a
// second parallel status system. status is derived from stage, never set
// independently, so the two can't drift.
export interface PipelineStage {
  stage: string;
  status: TaskStatus;
}

export const PIPELINES: Record<string, PipelineStage[]> = {
  "photo-video": [
    { stage: "Creative Brief", status: "todo" },
    { stage: "Scouting", status: "in_progress" },
    { stage: "Shoot Day", status: "in_progress" },
    { stage: "Ingest & Selects", status: "in_progress" },
    { stage: "Post-Production/Color", status: "in_progress" },
    { stage: "Review", status: "review" },
    { stage: "Delivery", status: "done" },
  ],
  design: [
    { stage: "Discovery", status: "todo" },
    { stage: "Concept", status: "in_progress" },
    { stage: "Drafts", status: "in_progress" },
    { stage: "Client Revisions", status: "review" },
    { stage: "Polish", status: "in_progress" },
    { stage: "Handoff", status: "done" },
  ],
  web: [
    { stage: "Wireframe", status: "todo" },
    { stage: "UI Approval", status: "review" },
    { stage: "Front-End", status: "in_progress" },
    { stage: "Back-End/CMS", status: "in_progress" },
    { stage: "QA", status: "review" },
    { stage: "Launch", status: "done" },
  ],
  smm: [
    { stage: "Monthly Strategy", status: "todo" },
    { stage: "Content Batching", status: "in_progress" },
    { stage: "Copywriting", status: "in_progress" },
    { stage: "Approval", status: "review" },
    { stage: "Scheduling", status: "in_progress" },
    { stage: "Analytics", status: "done" },
  ],
};

export function pipelineFor(serviceType: string | null | undefined): PipelineStage[] | null {
  if (!serviceType) return null;
  return PIPELINES[serviceType] ?? null;
}

export function statusForStage(serviceType: string | null | undefined, stage: string): TaskStatus {
  const pipeline = pipelineFor(serviceType);
  return pipeline?.find((s) => s.stage === stage)?.status ?? "todo";
}
