import { cn } from "@/lib/utils";

// The pill-in-a-track view switcher (Program's views, Folders' modes) —
// previously two hand-rolled copies whose inactive options gave zero hover
// feedback. Active state matches the Sidebar/TopNav active-pill language.
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex w-fit max-w-full gap-1 overflow-x-auto scrollbar-none rounded-full border border-border bg-card p-1 shadow-sm", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors",
            value === opt.value
              ? "bg-primary font-medium text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
