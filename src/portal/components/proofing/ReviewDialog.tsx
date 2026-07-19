import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { api, type PortalFile } from "@portal/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@portal/components/ui/dialog";
import { Button } from "@portal/components/ui/button";
import { ApprovalStatusPill } from "@portal/components/ui/status-pill";
import { useToast } from "@portal/components/ui/toast";
import { ImageProofer, type PendingPin } from "@portal/components/proofing/ImageProofer";
import { VideoProofer } from "@portal/components/proofing/VideoProofer";
import { CommentThread } from "@portal/components/proofing/CommentThread";
import { formatTimecode } from "@portal/lib/format";

export function ReviewDialog({ file, open, onOpenChange }: { file: PortalFile; open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [pendingTimecode, setPendingTimecode] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const commentsQuery = useQuery({
    queryKey: ["portal", "comments", file.id],
    queryFn: () => api.comments.list(file.id),
    enabled: open,
  });

  const createComment = useMutation({
    mutationFn: () =>
      api.comments.create({
        file_id: file.id,
        body: draft,
        x_pct: pendingPin?.x_pct,
        y_pct: pendingPin?.y_pct,
        timecode_seconds: pendingTimecode ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal", "comments", file.id] });
      setDraft("");
      setPendingPin(null);
      setPendingTimecode(null);
    },
    onError: () => toast({ title: "Couldn't post your comment", description: "Check your connection and try again.", variant: "destructive" }),
  });

  const toggleResolve = useMutation({
    mutationFn: ({ id, resolved }: { id: string; resolved: boolean }) => api.comments.resolve(id, resolved),
    // optimistic: a client clicking "resolved" expects the check to land
    // immediately, not after a round trip - roll back on failure instead.
    onMutate: async ({ id, resolved }) => {
      await queryClient.cancelQueries({ queryKey: ["portal", "comments", file.id] });
      const previous = queryClient.getQueryData(["portal", "comments", file.id]);
      queryClient.setQueryData(["portal", "comments", file.id], (old: any) =>
        (old ?? []).map((c: any) => (c.id === id ? { ...c, resolved } : c)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["portal", "comments", file.id], context.previous);
      toast({ title: "Couldn't update that comment", variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["portal", "comments", file.id] }),
  });

  const setApproval = useMutation({
    mutationFn: (status: "approved" | "changes_requested") => api.files.setApproval(file.id, status),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: ["portal", "files"] });
      const previous = queryClient.getQueriesData({ queryKey: ["portal", "files"] });
      queryClient.setQueriesData({ queryKey: ["portal", "files"] }, (old: any) =>
        Array.isArray(old) ? old.map((f: PortalFile) => (f.id === file.id ? { ...f, approval_status: status } : f)) : old,
      );
      return { previous };
    },
    onSuccess: (_data, status) => {
      toast({ title: status === "approved" ? "Deliverable approved" : "Changes requested", description: "Lumine has been notified." });
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast({ title: "Couldn't save your review", description: "Try again in a moment.", variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["portal", "files"] }),
  });

  const isVideo = (file.content_type || "").startsWith("video/");
  const isImage = (file.content_type || "").startsWith("image/");

  const pendingLabel = pendingPin ? "on the pinned spot" : pendingTimecode != null ? `at ${formatTimecode(pendingTimecode)}` : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent open={open} className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="truncate">{file.name}</DialogTitle>
            <ApprovalStatusPill status={file.approval_status} />
          </div>
          <DialogDescription>Leave feedback directly on the deliverable, or approve it once it's ready.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {isVideo && file.url ? (
              <VideoProofer
                url={file.url}
                comments={commentsQuery.data ?? []}
                pendingTimecode={pendingTimecode}
                onPlaceTimecode={(seconds) => {
                  setPendingTimecode(seconds);
                  setPendingPin(null);
                }}
              />
            ) : isImage && file.url ? (
              <ImageProofer
                url={file.url}
                alt={file.name}
                comments={commentsQuery.data ?? []}
                pendingPin={pendingPin}
                onPlacePin={(pin) => {
                  setPendingPin(pin);
                  setPendingTimecode(null);
                }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                This file type can't be previewed here yet.{" "}
                {file.url && (
                  <a href={file.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Open it directly →
                  </a>
                )}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" disabled={setApproval.isPending} onClick={() => setApproval.mutate("changes_requested")}>
                <ThumbsDown />
                Request Changes
              </Button>
              <Button className="flex-1" disabled={setApproval.isPending} onClick={() => setApproval.mutate("approved")}>
                <ThumbsUp />
                Approve
              </Button>
            </div>
          </div>

          <div className="max-h-[60vh] lg:max-h-[65vh]">
            <CommentThread
              comments={commentsQuery.data ?? []}
              pendingLabel={pendingLabel}
              draft={draft}
              onDraftChange={setDraft}
              onSubmit={() => createComment.mutate()}
              onCancelPin={() => {
                setPendingPin(null);
                setPendingTimecode(null);
              }}
              onToggleResolve={(id, resolved) => toggleResolve.mutate({ id, resolved })}
              submitting={createComment.isPending}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
