import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Coffee, Send, User } from "lucide-react";
import { api, type MessageAttachment } from "@/lib/api";
import { getSession } from "@/lib/session";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

// What can be shared - a real file (goes to a person as a DM attachment, or
// to Water Cooler as a real post attachment) or a project (goes to a person
// only, as an in-app deep link - Water Cooler doesn't have a project-link
// concept in its schema and forcing one in would be scope creep for what's
// really a "hey, check this out" ping).
export type ShareItem =
  | { kind: "file"; name: string; fileId: string; url: string | null }
  | { kind: "project"; name: string; engagementId: string };

export function ShareDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ShareItem | null;
}) {
  const session = getSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list, enabled: open });
  const teammates = (teamQuery.data ?? []).filter((m) => m.id !== session?.user.id);

  const [target, setTarget] = useState<"person" | "watercooler">("person");
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  function reset() {
    setTarget("person");
    setRecipientId(null);
    setNote("");
  }

  const shareMutation = useMutation({
    mutationFn: async () => {
      if (!item) throw new Error("Nothing to share");
      if (target === "person") {
        if (!recipientId) throw new Error("Pick someone to share with");
        const attachment: MessageAttachment =
          item.kind === "file"
            ? { kind: "file", name: item.name, url: item.url, fileId: item.fileId }
            : { kind: "project", name: item.name, engagementId: item.engagementId };
        await api.teamMessages.send(recipientId, note.trim(), attachment);
        return;
      }
      // Water Cooler - files only, see ShareItem comment above.
      if (item.kind !== "file") throw new Error("Only files can be shared to Water Cooler");
      await api.waterCooler.post(note.trim(), { fileId: item.fileId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: target === "person" ? ["team-messages"] : ["water-cooler"] });
      toast({ title: target === "person" ? "Shared" : "Posted to Water Cooler" });
      onOpenChange(false);
      reset();
    },
    onError: (err: Error) => toast({ title: "Couldn't share", description: err.message, variant: "destructive" }),
  });

  if (!item) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent open={open}>
        <DialogHeader>
          <DialogTitle>Share "{item.name}"</DialogTitle>
          <DialogDescription>Send it to a teammate, or post it to Water Cooler.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTarget("person")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm transition-colors",
                target === "person" ? "border-primary bg-accent" : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              <User className="size-4.5" />
              A teammate
            </button>
            <button
              type="button"
              disabled={item.kind !== "file"}
              onClick={() => setTarget("watercooler")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                target === "watercooler" ? "border-primary bg-accent" : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              <Coffee className="size-4.5" />
              Water Cooler
            </button>
          </div>

          {target === "person" && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Send to</p>
              <div className="flex flex-wrap gap-1.5">
                {teammates.length === 0 && <p className="text-sm text-muted-foreground">No teammates yet.</p>}
                {teammates.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setRecipientId(m.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      recipientId === m.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {m.name || m.role}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Add a note (optional)</p>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Say something about it…" rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => shareMutation.mutate()}
            disabled={shareMutation.isPending || (target === "person" && !recipientId)}
          >
            <Send className="size-4" />
            {shareMutation.isPending ? "Sharing…" : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
