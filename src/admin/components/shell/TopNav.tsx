import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { clearSession, type Session } from "@/lib/session";
import { api } from "@/lib/api";
import { StatusDot } from "@/components/shell/StatusDot";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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

  return (
    <header className="flex flex-wrap items-center gap-3 px-6 pb-2 pt-4">
      <div className="rounded-full border border-border bg-card px-6 py-2.5 font-display text-[1.05rem] font-bold tracking-wide shadow-sm">
        LUMINE
      </div>

      <nav className="mr-auto flex gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
        {TABS.map(({ page: p, label }) => (
          <button
            key={p}
            type="button"
            onClick={() => onNavigate(p)}
            className={cn(
              "rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
              page === p && "font-semibold text-primary",
            )}
          >
            {label}
          </button>
        ))}
      </nav>

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
    </header>
  );
}
