import { useEffect, useState } from "react";
import { Bell, Bot, Check, ChevronDown, MessageSquare, MessageCircle, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { clearSession, type Session } from "@/lib/session";
import { api } from "@/lib/api";
import { useTheme, type ThemePref } from "@/lib/theme";
import type { DeepLinkTarget } from "@/lib/deepLink";
import { StatusDot } from "@/components/shell/StatusDot";
import { TeamChatPanel, useUnreadTeamMessageCount } from "@/components/shell/TeamChatPanel";
import { NotificationsPanel, useUnreadNotificationCount } from "@/components/shell/NotificationsPanel";
import { AssistantPanel } from "@/components/shell/AssistantPanel";
import { CommandPalette } from "@/components/shell/CommandPalette";
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
  onNavigateTo,
  session,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
  onNavigateTo: (target: DeepLinkTarget) => void;
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

  // Team direct messages - teammate-to-teammate chat, separate from the AI
  // Inbox above (visitor <-> AI conversations).
  const [chatOpen, setChatOpen] = useState(false);
  const unreadMessages = useUnreadTeamMessageCount();

  // Lumine Assistant - a private, general-purpose AI helper per team
  // member. No badge/count: unlike the other panels this isn't tracking
  // anything incoming, it's a tool you open when you want it.
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Task assigned to you, new lead, new deliverable comment - the badge and
  // its count go quiet in focus mode (me.focus_mode), but the feed itself
  // still fills up so nothing's lost once focus mode turns back off.
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadNotifications = useUnreadNotificationCount();
  const showNotificationBadge = unreadNotifications > 0 && !me?.focus_mode;

  // Global search - Cmd/Ctrl+K from anywhere in the admin, not just when
  // focus happens to be inside this header.
  const [paletteOpen, setPaletteOpen] = useState(false);
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
              onClick={() => setPaletteOpen(true)}
              aria-label="Search everything"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Search className="size-4.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Search · ⌘K</TooltipContent>
        </Tooltip>

        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onNavigate={onNavigateTo} />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              aria-label="Open notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bell className="size-4.5" />
              {showNotificationBadge && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>Notifications{unreadNotifications > 0 ? ` · ${unreadNotifications} unread` : ""}</TooltipContent>
        </Tooltip>

        <NotificationsPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} onNavigate={onNavigateTo} />

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

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              aria-label="Open team chat"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MessageCircle className="size-4.5" />
              {unreadMessages > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>Team chat{unreadMessages > 0 ? ` · ${unreadMessages} unread` : ""}</TooltipContent>
        </Tooltip>

        <TeamChatPanel open={chatOpen} onOpenChange={setChatOpen} onNavigate={onNavigateTo} />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setAssistantOpen(true)}
              aria-label="Open Lumine Assistant"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bot className="size-4.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Lumine Assistant</TooltipContent>
        </Tooltip>

        <AssistantPanel open={assistantOpen} onOpenChange={setAssistantOpen} />

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
