import { Sparkles } from "lucide-react";
import type { Page } from "@/App";

const LABELS: Record<Page, string> = {
  overview: "Overview",
  activity: "Activity",
  inbox: "AI Inbox",
  manage: "Manage",
  projects: "Projects",
  program: "Program",
  folders: "Folders",
  documents: "Documents",
  profile: "Settings",
};

// Honest placeholder, not a fake screen — the admin rebuild is happening
// section by section (see project memory: project-admin-react-rebuild),
// Overview first. Everything else lands here until its turn.
export function ComingSoonPage({ page }: { page: Page }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Sparkles className="size-5" />
      </div>
      <h2 className="font-display text-xl font-medium">{LABELS[page]} is being rebuilt</h2>
      <p className="max-w-xs text-sm text-muted-foreground">
        This section is next in line for the redesign. Overview shipped first — check back soon.
      </p>
    </div>
  );
}
