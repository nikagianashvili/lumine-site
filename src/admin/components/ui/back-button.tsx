import { ArrowLeft } from "lucide-react";

// The "← All X" affordance at the top of every detail view — was four
// inline copies (clients, projects, folders, playbook).
export function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-fit items-center gap-1.5 rounded-full text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" />
      {label}
    </button>
  );
}
