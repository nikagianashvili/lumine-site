import { useQuery } from "@tanstack/react-query";
import { FileText, Download } from "lucide-react";
import { api } from "@portal/lib/api";
import { useDelayedLoading } from "@portal/lib/useDelayedLoading";
import { Card } from "@portal/components/ui/card";
import { Skeleton } from "@portal/components/ui/skeleton";
import { ErrorState } from "@portal/components/ui/error-state";
import { EmptyState } from "@portal/components/ui/empty-state";
import { formatDateFull, formatSize } from "@portal/lib/format";

export function DocumentsPage() {
  const filesQuery = useQuery({ queryKey: ["portal", "files", "document"], queryFn: () => api.files.list("document") });
  const showLoading = useDelayedLoading(filesQuery.isLoading);

  if (showLoading) {
    return (
      <div className="flex flex-col gap-2 pt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (filesQuery.isError) {
    return (
      <div className="pt-6">
        <ErrorState title="Couldn't load your documents" onRetry={() => filesQuery.refetch()} />
      </div>
    );
  }

  const files = filesQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Documents</h1>
        <p className="text-sm text-muted-foreground">Contracts, brand guidelines, and other files Lumine has shared with you.</p>
      </div>

      {files.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" description="Contracts and reference files will appear here once Lumine shares them." />
      ) : (
        <Card>
          <div className="flex flex-col divide-y divide-border">
            {files.map((f) => (
              <a
                key={f.id}
                href={f.url ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <FileText className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{f.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {formatDateFull(f.created_at)}
                    {f.size_bytes ? ` · ${formatSize(f.size_bytes)}` : ""}
                  </span>
                </span>
                <Download className="size-4 shrink-0 text-muted-foreground" />
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
