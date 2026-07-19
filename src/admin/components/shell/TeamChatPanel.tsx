import { useMemo, useRef, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, Send, MessageCircle, Check, CheckCheck, FileIcon, Briefcase, ExternalLink } from "lucide-react";
import { api, type TeamMessage, type MessageAttachment } from "@/lib/api";
import { getSession } from "@/lib/session";
import { initials, timeAgo } from "@/lib/format";
import type { DeepLinkTarget } from "@/lib/deepLink";
import { StatusDot } from "@/components/shell/StatusDot";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

// Sent (left the client) -> Delivered (recipient's client has fetched it,
// server-stamped) -> Read (recipient opened the thread). Only meaningful on
// my own outgoing messages.
function ReceiptIcon({ message }: { message: TeamMessage }) {
  if (message.read_at) return <CheckCheck className="size-3.5 text-primary-foreground" />;
  if (message.delivered_at) return <CheckCheck className="size-3.5 opacity-70" />;
  return <Check className="size-3.5 opacity-70" />;
}

function AttachmentCard({
  attachment,
  tone,
  onNavigate,
}: {
  attachment: MessageAttachment;
  tone: "sent" | "received";
  onNavigate?: (target: DeepLinkTarget) => void;
}) {
  const Icon = attachment.kind === "project" ? Briefcase : FileIcon;
  const className = cn(
    "flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-xs transition-colors",
    tone === "sent"
      ? "border-primary-foreground/25 bg-primary-foreground/10 hover:bg-primary-foreground/15"
      : "border-border bg-card hover:border-primary/30",
  );
  const inner = (
    <>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg",
          tone === "sent" ? "bg-primary-foreground/15" : "bg-muted",
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-left font-medium">{attachment.name}</span>
      {(attachment.url || attachment.kind === "project") && <ExternalLink className="size-3 shrink-0 opacity-60" />}
    </>
  );

  if (attachment.kind === "project" && attachment.engagementId) {
    return (
      <button
        type="button"
        onClick={() => onNavigate?.({ page: "projects", engagementId: attachment.engagementId! })}
        className={className}
      >
        {inner}
      </button>
    );
  }
  return (
    <a href={attachment.url ?? undefined} target={attachment.url ? "_blank" : undefined} rel="noreferrer" className={className}>
      {inner}
    </a>
  );
}

export function TeamChatPanel({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (target: DeepLinkTarget) => void;
}) {
  const reduceMotion = useReducedMotion();
  const session = getSession();
  const me = session?.user.id;
  const queryClient = useQueryClient();
  const toast = useToast();
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
    onError: (err: Error) => toast({ title: "Message didn't send", description: err.message, variant: "destructive" }),
  });
  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.teamMessages.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-messages"] }),
    onError: (err: Error) => toast({ title: "Couldn't mark message read", description: err.message, variant: "destructive" }),
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
    bottomRef.current?.scrollIntoView({ block: "end", behavior: reduceMotion ? "auto" : "smooth" });
  }, [activeThread.length, activeId, reduceMotion]);

  // markingRef tracks ids already sent to the server this "session" (cleared
  // when switching threads) so the 5s poll doesn't refire a PATCH for a
  // message whose read_at hasn't round-tripped back into `messages` yet.
  const markingRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    markingRef.current.clear();
  }, [activeId]);
  useEffect(() => {
    if (!activeId) return;
    activeThread
      .filter((m) => m.recipient_id === me && !m.read_at && !markingRef.current.has(m.id))
      .forEach((m) => {
        markingRef.current.add(m.id);
        markReadMutation.mutate(m.id);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, messages]);

  function handleSend() {
    if (!activeId || !draft.trim()) return;
    // Clear on success, not immediately - a failed send previously wiped the
    // composer with no error shown, silently losing what was typed.
    sendMutation.mutate(
      { recipientId: activeId, body: draft.trim() },
      { onSuccess: () => setDraft("") },
    );
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
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                {initials(activeMember.name || activeMember.role)}
                <StatusDot status={activeMember.status} focusMode={activeMember.focus_mode} />
              </span>
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
            {messagesQuery.isError ? (
              <ErrorState message={messagesQuery.error.message} onRetry={() => messagesQuery.refetch()} />
            ) : threads.length === 0 ? (
              <EmptyState icon={MessageCircle} title="No teammates yet" description="Add team members to start a conversation." />
            ) : (
              threads.map(({ member, last, unread }) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setActiveId(member.id)}
                  className="flex items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-muted"
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
                    <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      {last?.sender_id === me && <ReceiptIcon message={last} />}
                      {last ? (
                        <span className="truncate">
                          {last.sender_id === me && "You: "}
                          {last.attachment ? `📎 ${last.attachment.name}` : last.body}
                        </span>
                      ) : (
                        "No messages yet"
                      )}
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
            <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-5">
              {activeThread.length === 0 ? (
                <EmptyState icon={MessageCircle} title="Say hello" description={`Start the conversation with ${activeMember.name || activeMember.role}.`} />
              ) : (
                <AnimatePresence initial={false}>
                  {activeThread.map((m, i) => {
                    const mine = m.sender_id === me;
                    const prevSameSender = i > 0 && activeThread[i - 1].sender_id === m.sender_id;
                    return (
                      <motion.div
                        key={m.id}
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.16 }}
                        className={cn("flex", mine ? "justify-end" : "justify-start", prevSameSender ? "mt-0.5" : "mt-2.5")}
                      >
                        <div
                          className={cn(
                            "flex max-w-[80%] flex-col gap-1.5 rounded-2xl px-3 py-2 text-sm",
                            mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                          )}
                        >
                          {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
                          {m.attachment && (
                            <AttachmentCard
                              attachment={m.attachment}
                              tone={mine ? "sent" : "received"}
                              onNavigate={(target) => {
                                onNavigate?.(target);
                                onOpenChange(false);
                              }}
                            />
                          )}
                          <p
                            className={cn(
                              "flex items-center justify-end gap-1 text-[10px]",
                              mine ? "text-primary-foreground/70" : "text-muted-foreground",
                            )}
                          >
                            {timeAgo(m.created_at)}
                            {mine && <ReceiptIcon message={m} />}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
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
