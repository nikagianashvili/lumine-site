import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getSession, type Session } from "@/lib/session";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopNav } from "@/components/shell/TopNav";
import { OverviewPage } from "@/pages/Overview";
import { ProgramPage } from "@/pages/Program";
import { ProjectsPage } from "@/pages/Projects";
import { ArchivePage } from "@/pages/Archive";
import { WarRoomPage } from "@/pages/WarRoom";
import { WaterCoolerPage } from "@/pages/WaterCooler";
import { FoldersPage } from "@/pages/Folders";
import { DocumentsPage } from "@/pages/Documents";
import { PlaybookPage } from "@/pages/Playbook";
import { ActivityPage } from "@/pages/Activity";
import { ManagePage } from "@/pages/Manage";
import { InboxPage } from "@/pages/Inbox";
import { ProfilePage } from "@/pages/Profile";

export type Page =
  | "overview"
  | "activity"
  | "inbox"
  | "manage"
  | "projects"
  | "program"
  | "archive"
  | "warroom"
  | "watercooler"
  | "folders"
  | "documents"
  | "playbook"
  | "profile";

// Every Page value maps to a real component now (Phase 9 was the last
// placeholder) - a plain Record, not Partial, so TS itself enforces that
// adding a new Page value here requires wiring its component too.
const PAGES: Record<Page, React.ComponentType> = {
  overview: OverviewPage,
  activity: ActivityPage,
  program: ProgramPage,
  projects: ProjectsPage,
  archive: ArchivePage,
  warroom: WarRoomPage,
  watercooler: WaterCoolerPage,
  folders: FoldersPage,
  documents: DocumentsPage,
  playbook: PlaybookPage,
  manage: ManagePage,
  inbox: InboxPage,
  profile: ProfilePage,
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function App() {
  const [session, setSession] = useState<Session | null | "checking">("checking");
  const [page, setPage] = useState<Page>("overview");

  useEffect(() => {
    const s = getSession();
    if (!s) {
      window.location.href = "/admin-login";
      return;
    }
    setSession(s);
  }, []);

  if (session === "checking" || session === null) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-full">
        <Sidebar page={page} onNavigate={setPage} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav page={page} onNavigate={setPage} session={session} />
          <main className="flex-1 overflow-y-auto px-6 pb-6">
            {(() => {
              const PageComponent = PAGES[page];
              return <PageComponent />;
            })()}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
