import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getSession, type Session } from "@portal/lib/session";
import { TopNav } from "@portal/components/shell/TopNav";
import { ToastProvider } from "@portal/components/ui/toast";
import { DashboardPage } from "@portal/pages/Dashboard";
import { DeliverablesPage } from "@portal/pages/Deliverables";
import { DocumentsPage } from "@portal/pages/Documents";

export type Page = "dashboard" | "deliverables" | "documents";

const PAGES: Record<Page, React.ComponentType> = {
  dashboard: DashboardPage,
  deliverables: DeliverablesPage,
  documents: DocumentsPage,
};

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Dashboard",
  deliverables: "Deliverables",
  documents: "Documents",
};

function pageFromUrl(): Page {
  const p = new URLSearchParams(window.location.search).get("page");
  return p === "deliverables" || p === "documents" ? p : "dashboard";
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function App() {
  const [session, setSession] = useState<Session | null | "checking">("checking");
  const [page, setPageState] = useState<Page>(pageFromUrl);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      window.location.href = "/portal-login";
      return;
    }
    setSession(s);
  }, []);

  useEffect(() => {
    document.title = `${PAGE_TITLES[page]} · Lumine Client Portal`;
  }, [page]);

  // Deep-linkable page state (Web Interface Guidelines: persisted URL
  // state) - a client can bookmark/refresh/share "?page=deliverables"
  // and land back where they were, and the browser back button works.
  useEffect(() => {
    const onPopState = () => setPageState(pageFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(next: Page) {
    setPageState(next);
    const url = new URL(window.location.href);
    url.searchParams.set("page", next);
    window.history.pushState({}, "", url);
  }

  if (session === "checking" || session === null) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="flex h-full flex-col">
          <TopNav page={page} onNavigate={navigate} session={session} />
          <main className="flex-1 overflow-y-auto px-4 pb-8 md:px-6">
            <div className="mx-auto w-full max-w-[72rem]">
              {(() => {
                const PageComponent = PAGES[page];
                return <PageComponent />;
              })()}
            </div>
          </main>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}
