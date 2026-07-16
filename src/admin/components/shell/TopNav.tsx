import { useState } from "react";
import { Check, ChevronDown, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { clearSession, type Session } from "@/lib/session";
import { api } from "@/lib/api";
import { useTheme, type ThemePref } from "@/lib/theme";
import { StatusDot } from "@/components/shell/StatusDot";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody } from "@/components/ui/sheet";
import { InboxPage } from "@/pages/Inbox";
import type { Page } from "@/App";

const TABS: { page: Page; label: string }[] = [
  { page: "overview", label: "Overview" },
  { page: "activity", label: "Activity" },
  { page: "inbox", label: "AI Inbox" },
  { page: "manage", label: "Manage" },
  { page: "projects", label: "Projects" },
  { page: "archive", label: "Archive" },
  { page: "warroom", label: "War Room" },
  { page: "watercooler", label: "Water Cooler" },
  { page: "program", label: "Program" },
  { page: "folders", label: "Folders" },
  { page: "documents", label: "Documents" },
  { page: "playbook", label: "Playbook" },
];

const THEME_OPTIONS: { value: ThemePref; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function TopNav({
  page,
  onNavigate,
  session,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
  session: Session;
}) {
  const initial = (session.user.email || "?").charAt(0).toUpperCase();
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  const me = teamQuery.data?.find((m) => m.id === session.user.id);
  // Theme lives here too (not just the rail): below md the rail is hidden,
  // and this menu is the only way to switch themes on a phone.
  const { pref, setTheme } = useTheme();

  // AI Inbox as a floating icon + slide-over, not just a buried nav tab -
  // it's easy to forget it's there among a dozen other tabs. The full
  // "AI Inbox" page tab still exists for deep work; this is the at-a-glance
  // path. Badge counts conversations not yet triaged (status "open").
  const [inboxOpen, setInboxOpen] = useState(false);
  const convosQuery = useQuery({ queryKey: ["conversations"], queryFn: api.conversations.list });
  const openConvoCount = (convosQuery.data ?? []).filter((c) => c.status === "open").length;

  return (
    <header className="flex flex-wrap items-center gap-3 px-4 pb-2 pt-4 md:px-6">
      <button
        type="button"
        onClick={() => onNavigate("overview")}
        aria-label="Go to Overview"
        className="rounded-full border border-border bg-card px-6 py-2.5 font-display text-[1.05rem] font-bold tracking-wide shadow-sm transition-shadow hover:shadow-md"
      >
        LUMINE
      </button>

      {/* One scrollable row on small screens (order-last drops it below the
          logo/avatar) instead of wrapping into 3–4 rows of pills. */}
      <nav className="order-last flex w-full min-w-0 gap-1 overflow-x-auto scrollbar-none rounded-full border border-border bg-card p-1 shadow-sm lg:order-none lg:mr-auto lg:w-auto">
        {TABS.map(({ page: p, label }) => (
          <button
            key={p}
            type="button"
            aria-current={page === p ? "page" : undefined}
            onClick={() => onNavigate(p)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors",
              page === p
                ? "bg-primary font-medium text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3 lg:ml-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setInboxOpen(true)}
              aria-label="Open AI Inbox"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MessageSquare className="size-4.5" />
              {openConvoCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {openConvoCount > 9 ? "9+" : openConvoCount}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>AI Inbox{openConvoCount > 0 ? ` · ${openConvoCount} to triage` : ""}</TooltipContent>
        </Tooltip>

        <Sheet open={inboxOpen} onOpenChange={setInboxOpen}>
          <SheetContent open={inboxOpen}>
            <SheetHeader>
              <SheetTitle>AI Inbox</SheetTitle>
              <SheetDescription>Every conversation Lumine AI has had with a visitor.</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <InboxPage embedded />
            </SheetBody>
          </SheetContent>
        </Sheet>

        {/* team presence — who else is around, at a glance. Excludes "me";
            hidden below sm since there's no room next to the tab strip there. */}
        {(() => {
          const teammates = (teamQuery.data ?? []).filter((m) => m.id !== session.user.id);
          if (teammates.length === 0) return null;
          const MAX_SHOWN = 5;
          const shown = teammates.slice(0, MAX_SHOWN);
          const overflow = teammates.length - shown.length;
          return (
            <div className="hidden items-center -space-x-2 sm:flex">
              {shown.map((m) => (
                <Tooltip key={m.id}>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-background ring-2 ring-background",
                        m.focus_mode ? "bg-muted-foreground" : "bg-foreground",
                      )}
                    >
                      {(m.name || m.role || "?").charAt(0).toUpperCase()}
                      <StatusDot status={m.status} focusMode={m.focus_mode} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {m.name || m.role}
                    {m.name && m.role ? ` · ${m.role}` : ""}
                    {m.focus_mode ? " · Focus mode" : ""}
                  </TooltipContent>
                </Tooltip>
              ))}
              {overflow > 0 && (
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-2 ring-background">
                  +{overflow}
                </span>
              )}
            </div>
          );
        })()}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full p-1 outline-none">
          <span
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-background",
              me?.focus_mode ? "bg-muted-foreground" : "bg-foreground",
            )}
          >
            {initial}
            <StatusDot status={me?.status} focusMode={me?.focus_mode} />
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onNavigate("profile")}>Profile settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          {THEME_OPTIONS.map((opt) => (
            <DropdownMenuItem key={opt.value} onClick={() => setTheme(opt.value)}>
              <span className="flex-1">{opt.label}</span>
              {pref === opt.value && <Check className="size-3.5" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              clearSession();
              window.location.href = "/admin-login";
            }}
          >
            Log out
          </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
