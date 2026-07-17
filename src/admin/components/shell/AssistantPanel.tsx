import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bot, Send, Sparkles, Trash2 } from "lucide-react";
import { api, type AssistantMessage } from "@/lib/api";
import { renderMarkdownLite } from "@/lib/markdownLite";
import { timeAgo } from "@/lib/format";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody } from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Draft a follow-up email to a client who's gone quiet",
  "Brainstorm 5 Instagram caption ideas for a hotel client",
  "Rewrite this more concisely: ",
  "Summarize what our Growth retainer tier includes",
];

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function BotAvatar() {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm">
      <Sparkles className="size-3.5" />
    </span>
  );
}

export function AssistantPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const reduceMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const toast = useToast();
  const messagesQuery = useQuery({ queryKey: ["assistant-messages"], queryFn: api.assistant.list, enabled: open });
  const messages = messagesQuery.data ?? [];
  const [draft, setDraft] = useState("");
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.assistant.send(content),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["assistant-messages"] });
      const previous = queryClient.getQueryData<AssistantMessage[]>(["assistant-messages"]);
      const optimistic: AssistantMessage = {
        id: `pending-${Date.now()}`,
        team_member_id: "",
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<AssistantMessage[]>(["assistant-messages"], (old) => [...(old ?? []), optimistic]);
      return { previous };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assistant-messages"] }),
    onError: (err: Error, _content, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["assistant-messages"], ctx.previous);
      toast({ title: "The assistant couldn't reply", description: err.message, variant: "destructive" });
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => api.assistant.clear(),
    onSuccess: () => {
      queryClient.setQueryData(["assistant-messages"], []);
      setConfirmClearOpen(false);
    },
    onError: (err: Error) => toast({ title: "Couldn't clear conversation", description: err.message, variant: "destructive" }),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages.length, sendMutation.isPending, reduceMotion]);

  function send(text?: string) {
    const content = (text ?? draft).trim();
    if (!content || sendMutation.isPending) return;
    sendMutation.mutate(content);
    setDraft("");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent open={open} className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <BotAvatar />
              <div>
                <SheetTitle>Lumine Assistant</SheetTitle>
                <SheetDescription>Drafting, brainstorming, quick questions.</SheetDescription>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                aria-label="Clear conversation"
                onClick={() => setConfirmClearOpen(true)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </SheetHeader>

        <SheetBody className="flex flex-col gap-3">
          {messages.length === 0 && !sendMutation.isPending && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm">
                <Bot className="size-6" />
              </span>
              <div>
                <p className="text-sm font-medium">Ask me anything</p>
                <p className="mt-0.5 max-w-xs text-sm text-muted-foreground">
                  I can draft copy, brainstorm, and answer general questions. I don't see live client or project data.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDraft(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={cn("flex items-end gap-2", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "assistant" && <BotAvatar />}
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {m.role === "assistant" ? renderMarkdownLite(m.content) : <p className="whitespace-pre-wrap">{m.content}</p>}
                  <p className={cn("mt-1 text-[10px]", m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {timeAgo(m.created_at)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {sendMutation.isPending && (
            <div className="flex items-end gap-2">
              <BotAvatar />
              <div className="rounded-2xl bg-muted px-2">
                <ThinkingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </SheetBody>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end gap-2 border-t border-border p-3"
        >
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the assistant… (Shift+Enter for a new line)"
            rows={1}
            className="max-h-32 min-h-9 flex-1 resize-none rounded-2xl border border-input bg-card px-3.5 py-2 text-sm outline-none focus:border-ring"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sendMutation.isPending}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </form>
      </SheetContent>

      <ConfirmDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        title="Clear this conversation?"
        description="Every message in your assistant thread will be permanently deleted. This can't be undone."
        confirmLabel="Clear conversation"
        pending={clearMutation.isPending}
        onConfirm={() => clearMutation.mutate()}
      />
    </Sheet>
  );
}
