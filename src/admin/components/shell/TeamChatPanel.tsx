import { useMemo, useRef, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { api, type TeamMessage } from "@/lib/api";
import { getSession } from "@/lib/session";
import { initials, timeAgo } from "@/lib/format";
import { StatusDot } from "@/components/shell/StatusDot";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export function TeamChatPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const session = getSession();
  const me = session?.user.id;
  const queryClient = useQueryClient();
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  // Short poll while the panel is open - a real chat feature without
  // standing up a websocket/Realtime subscription for what is, for now, a
  // small team's occasional DMs.
  const messagesQuery = useQuery({
    queryKey: ["team-messages"],
    queryFn: api.teamMessages.list,
    refetchInterval: open ? 5000 : false,
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMutation = useMutation({
    mutationFn: ({ recipientId, body }: { recipientId: string; body: string }) => api.teamMessages.send(recipientId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-messages"] }),
  });
  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.teamMessages.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-messages"] }),
  });

  const teammates = (teamQuery.data ?? []).filter((m) => m.id !== me);
  const messages = messagesQuery.data ?? [];

  // Group into one thread per teammate, newest message + unread count for
  // the list view.
  const threads = useMemo(() => {
    return teammates
      .map((m) => {
        const withThem = messages.filter((msg) => msg.sender_id === m.id || msg.recipient_id === m.id);
        const last = withThem[withThem.length - 1];
        const unread = withThem.filter((msg) => msg.recipient_id === me && !msg.read_at).length;
        return { member: m, last, unread };
      })
      .sort((a, b) => {
        if (!a.last && !b.last) return 0;
        if (!a.last) return 1;
        if (!b.last) return -1;
        return new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime();
      });
  }, [teammates, messages, me]);

  const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0);

  const activeThread = activeId ? messages.filter((m) => m.sender_id === activeId || m.recipient_id === activeId) : [];
  const activeMember = teammates.find((m) => m.id === activeId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [activeThread.length, activeId]);

  useEffect(() => {
    if (!activeId) return;
    activeThread.filter((m) => m.recipient_id === me && !m.read_at).forEach((m) => markReadMutation.mutate(m.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, messages]);

  function handleSend() {
    if (!activeId || !draft.trim()) return;
    sendMutation.mutate({ recipientId: activeId, body: draft.trim() });
    setDraft("");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent open={open}>
        <SheetHeader>
          {activeMember ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveId(null)}
                aria-label="Back to conversations"
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div>
                <SheetTitle>{activeMember.name || activeMember.role}</SheetTitle>
                <SheetDescription>{activeMember.role}</SheetDescription>
              </div>
            </div>
          ) : (
            <>
              <SheetTitle>Team chat</SheetTitle>
              <SheetDescription>
                Direct messages with your team.
                {totalUnread > 0 && ` ${totalUnread} unread.`}
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        {!activeMember && (
          <SheetBody className="flex flex-col gap-1 p-2">
            {threads.length === 0 ? (
              <EmptyState icon={MessageCircle} title="No teammates yet" description="Add team members to start a conversation." />
            ) : (
              threads.map(({ member, last, unread }) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setActiveId(member.id)}
                  className="flex items-center gap-3 rounded-xl p-2.5 text-left hover:bg-muted"
                >
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                    {initials(member.name || member.role)}
                    <StatusDot status={member.status} focusMode={member.focus_mode} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{member.name || member.role}</span>
                      {last && <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(last.created_at)}</span>}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {last ? (last.sender_id === me ? `You: ${last.body}` : last.body) : "No messages yet"}
                    </span>
                  </span>
                  {unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </SheetBody>
        )}

        {activeMember && (
          <>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-5">
              {activeThread.length === 0 ? (
                <EmptyState icon={MessageCircle} title="Say hello" description={`Start the conversation with ${activeMember.name || activeMember.role}.`} />
              ) : (
                activeThread.map((m) => (
                  <div key={m.id} className={cn("flex", m.sender_id === me ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                        m.sender_id === me ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      <p>{m.body}</p>
                      <p className={cn("mt-0.5 text-[10px] opacity-70")}>{timeAgo(m.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message…"
                className="h-9 flex-1 rounded-full border border-input bg-card px-3.5 text-sm outline-none focus:border-ring"
              />
              <Button type="submit" size="icon" disabled={!draft.trim() || sendMutation.isPending} aria-label="Send message">
                <Send className="size-4" />
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function useUnreadTeamMessageCount() {
  const session = getSession();
  const me = session?.user.id;
  const messagesQuery = useQuery({ queryKey: ["team-messages"], queryFn: api.teamMessages.list, refetchInterval: 30000 });
  return (messagesQuery.data ?? []).filter((m: TeamMessage) => m.recipient_id === me && !m.read_at).length;
}
