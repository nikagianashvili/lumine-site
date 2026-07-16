import { Check, ChevronDown } from "lucide-react";
import { cn } from "@portal/lib/utils";
import { clearSession, type Session } from "@portal/lib/session";
import { useTheme, type ThemePref } from "@portal/lib/theme";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@portal/components/ui/dropdown-menu";
import type { Page } from "@portal/App";

const TABS: { page: Page; label: string }[] = [
  { page: "dashboard", label: "Dashboard" },
  { page: "deliverables", label: "Deliverables" },
  { page: "documents", label: "Documents" },
];

const THEME_OPTIONS: { value: ThemePref; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function TopNav({ page, onNavigate, session }: { page: Page; onNavigate: (p: Page) => void; session: Session }) {
  const initial = (session.user.name || session.user.company || session.user.email || "?").charAt(0).toUpperCase();
  const { pref, setTheme } = useTheme();

  return (
    <header className="flex flex-wrap items-center gap-3 px-4 pb-2 pt-4 md:px-6">
      <button
        type="button"
        onClick={() => onNavigate("dashboard")}
        aria-label="Go to Dashboard"
        className="rounded-full border border-border bg-card px-6 py-2.5 font-display text-[1.05rem] font-bold tracking-wide shadow-sm transition-shadow hover:shadow-md"
      >
        LUMINE
      </button>

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

      <DropdownMenu>
        <DropdownMenuTrigger className="ml-auto flex items-center gap-1.5 rounded-full p-1 outline-none lg:ml-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
            {initial}
          </span>
          <span className="hidden text-sm font-medium sm:inline">{session.user.company || session.user.email}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
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
              window.location.href = "/portal-login";
            }}
          >
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
