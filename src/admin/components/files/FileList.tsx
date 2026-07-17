import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, FileIcon, Share2 } from "lucide-react";
import { api, type AgencyFile } from "@/lib/api";
import { formatSize } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ShareDialog, type ShareItem } from "@/components/shell/ShareDialog";

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
  const toast = useToast();
  const [deleteTarget, setDeleteTarget] = useState<AgencyFile | null>(null);
  const [shareTarget, setShareTarget] = useState<AgencyFile | null>(null);
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.files.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast({ title: "Couldn't delete file", description: err.message, variant: "destructive" }),
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
            aria-label="Share file"
            onClick={() => setShareTarget(f)}
            className="flex-shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Share2 className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Delete file"
            onClick={() => setDeleteTarget(f)}
            className="flex-shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this file?"
        description={`"${deleteTarget?.name}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete file"
        pending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
      <ShareDialog
        open={!!shareTarget}
        onOpenChange={(open) => !open && setShareTarget(null)}
        item={shareTarget ? ({ kind: "file", name: shareTarget.name, fileId: shareTarget.id, url: shareTarget.url } satisfies ShareItem) : null}
      />
    </div>
  );
}
