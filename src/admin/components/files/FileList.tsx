import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, FileIcon } from "lucide-react";
import { api, type AgencyFile } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export function FileList({
  files,
  queryKey,
  emptyLabel,
  isLoading,
}: {
  files: AgencyFile[];
  queryKey: unknown[];
  emptyLabel: string;
  // Without this, "still fetching" and "confirmed empty" render the same
  // way - briefly claims empty on every load, not just when it's true.
  isLoading?: boolean;
}) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.files.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  if (isLoading) {
    return <Skeleton className="h-16" />;
  }

  if (files.length === 0) {
    return <p className="py-6 text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {files.map((f) => (
        <div key={f.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
          <FileIcon className="size-4 flex-shrink-0 text-muted-foreground" />
          {f.url ? (
            <a href={f.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-primary hover:underline">
              {f.name}
            </a>
          ) : (
            <span className="flex-1 truncate">{f.name}</span>
          )}
          {f.skills_tags.length > 0 && (
            <span className="flex-shrink-0 text-xs text-muted-foreground">{f.skills_tags.join(" ")}</span>
          )}
          <span className="flex-shrink-0 text-xs text-muted-foreground">{formatSize(f.size_bytes)}</span>
          <span className="w-24 flex-shrink-0 truncate text-xs text-muted-foreground">{f.team_members?.name || "—"}</span>
          <button
            type="button"
            aria-label="Delete file"
            onClick={() => {
              if (window.confirm(`Delete "${f.name}"? This can't be undone.`)) deleteMutation.mutate(f.id);
            }}
            className="flex-shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
