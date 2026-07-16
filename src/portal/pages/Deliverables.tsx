import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImageIcon, Film, FileIcon } from "lucide-react";
import { api, type PortalFile } from "@portal/lib/api";
import { useDelayedLoading } from "@portal/lib/useDelayedLoading";
import { Card } from "@portal/components/ui/card";
import { Skeleton } from "@portal/components/ui/skeleton";
import { ErrorState } from "@portal/components/ui/error-state";
import { EmptyState } from "@portal/components/ui/empty-state";
import { ApprovalStatusPill } from "@portal/components/ui/status-pill";
import { ReviewDialog } from "@portal/components/proofing/ReviewDialog";
import { formatDateShort } from "@portal/lib/format";

function FileThumb({ file }: { file: PortalFile }) {
  if ((file.content_type || "").startsWith("image/") && file.url) {
    return <img src={file.url} alt={file.name} className="h-full w-full object-cover" />;
  }
  const Icon = (file.content_type || "").startsWith("video/") ? Film : FileIcon;
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
      <Icon className="size-8" />
    </div>
  );
}

export function DeliverablesPage() {
  const filesQuery = useQuery({ queryKey: ["portal", "files", "creative"], queryFn: () => api.files.list("creative") });
  const [reviewing, setReviewing] = useState<PortalFile | null>(null);
  const showLoading = useDelayedLoading(filesQuery.isLoading);

  if (showLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  if (filesQuery.isError) {
    return (
      <div className="pt-6">
        <ErrorState title="Couldn't load your deliverables" onRetry={() => filesQuery.refetch()} />
      </div>
    );
  }

  const files = filesQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Deliverables</h1>
        <p className="text-sm text-muted-foreground">Review creative work, leave feedback, and approve when it's ready.</p>
      </div>

      {files.length === 0 ? (
        <EmptyState icon={ImageIcon} title="Nothing here yet" description="Deliverables Lumine sends over will show up here for review." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((f) => (
            <Card
              key={f.id}
              className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
              onClick={() => setReviewing(f)}
            >
              <div className="aspect-square w-full overflow-hidden">
                <FileThumb file={f} />
              </div>
              <div className="flex flex-col gap-1 p-3">
                <p className="truncate text-sm font-medium" title={f.name}>
                  {f.name}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{formatDateShort(f.created_at)}</span>
                  <ApprovalStatusPill status={f.approval_status} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {reviewing && (
        <ReviewDialog file={reviewing} open={!!reviewing} onOpenChange={(open) => !open && setReviewing(null)} />
      )}
    </div>
  );
}
