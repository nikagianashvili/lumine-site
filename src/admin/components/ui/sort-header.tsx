import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

// Sortable column header — was two inline copies (ClientsTable,
// Spreadsheet) that never showed which direction a column was sorted.
export function SortHeader({
  label,
  sorted,
  onClick,
}: {
  label: string;
  sorted: false | "asc" | "desc";
  onClick: () => void;
}) {
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 transition-colors hover:text-foreground">
      {label}
      <Icon className="size-3" />
    </button>
  );
}

// aria-sort value for the <th> wrapping a SortHeader
export function ariaSort(sorted: false | "asc" | "desc"): "ascending" | "descending" | undefined {
  if (sorted === "asc") return "ascending";
  if (sorted === "desc") return "descending";
  return undefined;
}
