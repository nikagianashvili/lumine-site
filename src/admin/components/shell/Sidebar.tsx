import {
  Sun,
  Moon,
  LayoutGrid,
  Activity,
  MessageSquare,
  FileText,
  Users,
  Briefcase,
  Archive,
  TrendingUp,
  Coffee,
  FolderOpen,
  BookOpen,
  Rows3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { clearSession } from "@/lib/session";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { Page } from "@/App";

const NAV: { page: Page; label: string; icon: typeof LayoutGrid }[] = [
  { page: "overview", label: "Overview", icon: LayoutGrid },
  { page: "activity", label: "Activity", icon: Activity },
  { page: "inbox", label: "AI Inbox", icon: MessageSquare },
  { page: "documents", label: "Documents", icon: FileText },
  { page: "manage", label: "Manage", icon: Users },
  { page: "projects", label: "Projects", icon: Briefcase },
  { page: "archive", label: "Archive", icon: Archive },
  { page: "warroom", label: "War Room", icon: TrendingUp },
  { page: "watercooler", label: "Water Cooler", icon: Coffee },
  { page: "folders", label: "Folders", icon: FolderOpen },
  { page: "playbook", label: "Playbook", icon: BookOpen },
  { page: "program", label: "Program", icon: Rows3 },
  { page: "profile", label: "Settings", icon: Settings },
];

// Hidden below md: on a phone the rail would eat 72px of width while
// duplicating the TopNav — its unique functions (theme, logout, settings)
// all exist in the TopNav avatar menu too.
export function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  const { pref, setTheme } = useTheme();

  return (
    <aside className="hidden w-[4.5rem] flex-shrink-0 flex-col items-center gap-1 py-4 md:flex">
      <div className="mb-3 flex flex-col gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
        <RailIcon active={pref === "light"} onClick={() => setTheme("light")} label="Light mode">
          <Sun />
        </RailIcon>
        <RailIcon active={pref === "dark"} onClick={() => setTheme("dark")} label="Dark mode">
          <Moon />
        </RailIcon>
      </div>

      <nav className="flex flex-1 flex-col gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
        {NAV.map(({ page: p, label, icon: Icon }) => (
          <RailIcon key={p} active={page === p} onClick={() => onNavigate(p)} label={label}>
            <Icon />
          </RailIcon>
        ))}
      </nav>

      <div className="flex flex-col gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
        <RailIcon
          label="Log out"
          onClick={() => {
            clearSession();
            window.location.href = "/admin-login";
          }}
        >
          <LogOut />
        </RailIcon>
      </div>
    </aside>
  );
}

function RailIcon({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors [&_svg]:size-[1.1rem]",
            active
              ? "bg-primary text-primary-foreground shadow-[0_0.4rem_1rem_-0.4rem_var(--color-primary)]"
              : "hover:bg-muted hover:text-foreground",
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
