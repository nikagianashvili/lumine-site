import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getSession, type Session } from "@/lib/session";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopNav } from "@/components/shell/TopNav";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
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

const PAGE_TITLES: Record<Page, string> = {
  overview: "Overview",
  activity: "Activity",
  inbox: "AI Inbox",
  manage: "Manage",
  projects: "Projects",
  program: "Program",
  archive: "Archive",
  warroom: "War Room",
  watercooler: "Water Cooler",
  folders: "Folders",
  documents: "Documents",
  playbook: "Playbook",
  profile: "Settings",
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

  useEffect(() => {
    document.title = `${PAGE_TITLES[page]} · Lumine Admin`;
  }, [page]);

  if (session === "checking" || session === null) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <ToastProvider>
          <div className="flex h-full">
            <Sidebar page={page} onNavigate={setPage} />
            <div className="flex min-w-0 flex-1 flex-col">
              <TopNav page={page} onNavigate={setPage} session={session} />
              <main className="flex-1 overflow-y-auto px-4 pb-6 md:px-6">
                {/* one shared reading width: previously Manage/Program ran
                    full-bleed on wide monitors while feed pages capped
                    themselves at arbitrary widths */}
                <div className="mx-auto w-full max-w-[88rem]">
                  {(() => {
                    const PageComponent = PAGES[page];
                    return <PageComponent />;
                  })()}
                </div>
              </main>
            </div>
          </div>
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
