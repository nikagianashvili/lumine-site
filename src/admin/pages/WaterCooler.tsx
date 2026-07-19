import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Coffee,
  Paperclip,
  Trophy,
  MessageCircle,
  Send,
  X,
  FileIcon,
  Film,
  ExternalLink,
} from "lucide-react";
import { api, type WaterCoolerPost, type WaterCoolerComment } from "@/lib/api";
import { getSession } from "@/lib/session";
import { initials, timeAgo, formatSize } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const QUICK_REACTIONS = ["🎉", "🔥", "👏", "❤️", "😂"];
const AVATAR_TINTS = ["bg-foreground", "bg-primary", "bg-info", "bg-success", "bg-warning"];
function avatarTint(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-background",
        avatarTint(name),
      )}
    >
      {initials(name)}
    </span>
  );
}

function FilePreview({ file }: { file: NonNullable<WaterCoolerPost["file"]> }) {
  const isImage = (file.content_type || "").startsWith("image/");
  const isVideo = (file.content_type || "").startsWith("video/");
  if (isImage && file.url) {
    return (
      <a href={file.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-border">
        <img src={file.url} alt={file.name} className="max-h-80 w-full object-cover" loading="lazy" />
      </a>
    );
  }
  return (
    <a
      href={file.url ?? undefined}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm transition-colors hover:border-primary/30"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        {isVideo ? <Film className="size-4 text-muted-foreground" /> : <FileIcon className="size-4 text-muted-foreground" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{file.name}</span>
        <span className="text-xs text-muted-foreground">{formatSize(file.size_bytes)}</span>
      </span>
      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
    </a>
  );
}

function CommentThread({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const commentsQuery = useQuery({ queryKey: ["water-cooler-comments", postId], queryFn: () => api.waterCoolerComments.list(postId) });
  const [draft, setDraft] = useState("");

  const postMutation = useMutation({
    mutationFn: (body: string) => api.waterCoolerComments.post(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["water-cooler-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["water-cooler"] });
      setDraft("");
    },
    onError: (err: Error) => toast({ title: "Couldn't post comment", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="flex flex-col gap-2.5 border-t border-border pt-3">
      {commentsQuery.isLoading && <Skeleton className="h-8" />}
      {(commentsQuery.data ?? []).map((c: WaterCoolerComment) => (
        <div key={c.id} className="flex items-start gap-2">
          <Avatar name={c.team_members?.name || "?"} />
          <div className="min-w-0 flex-1 rounded-xl bg-muted px-3 py-1.5 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{c.team_members?.name || "Someone"}</span>
              <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
            </div>
            <p className="text-foreground">{c.body}</p>
          </div>
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) postMutation.mutate(draft.trim());
        }}
        className="flex items-center gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a comment…"
          className="h-8 flex-1 rounded-full border border-input bg-card px-3 text-xs outline-none focus:border-ring"
        />
        <button
          type="submit"
          disabled={!draft.trim() || postMutation.isPending}
          aria-label="Post comment"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Send className="size-3.5" />
        </button>
      </form>
    </div>
  );
}

function PostCard({ post }: { post: WaterCoolerPost }) {
  const session = getSession();
  const queryClient = useQueryClient();
  const myId = session?.user.id;
  const [commentsOpen, setCommentsOpen] = useState(false);
  const authorName = post.type === "celebration" ? "Lumine" : post.team_members?.name || "Someone";

  const reactMutation = useMutation({
    mutationFn: (emoji: string) => api.waterCooler.react(post.id, emoji),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["water-cooler"] }),
  });

  return (
    <Card className={cn("flex flex-col gap-3 p-4", post.type === "celebration" && "border-primary/30 bg-accent")}>
      <div className="flex items-start gap-3">
        {post.type === "celebration" ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Trophy className="size-4" />
          </span>
        ) : (
          <Avatar name={authorName} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{authorName}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
          </div>
          {post.body && <p className="mt-0.5 whitespace-pre-wrap text-sm">{post.body}</p>}
        </div>
      </div>

      {post.file && <FilePreview file={post.file} />}
      {!post.file && post.file_url && (
        <a href={post.file_url} target="_blank" rel="noreferrer" className="inline-block w-fit text-xs text-primary hover:underline">
          {post.file_url}
        </a>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {QUICK_REACTIONS.map((emoji) => {
          const reactors = post.reactions?.[emoji] ?? [];
          const mine = myId ? reactors.includes(myId) : false;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => reactMutation.mutate(emoji)}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                mine ? "border-primary bg-primary/10" : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {emoji} {reactors.length > 0 && reactors.length}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          className={cn(
            "ml-auto flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs transition-colors",
            commentsOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <MessageCircle className="size-3.5" />
          {post.comment_count > 0 ? post.comment_count : "Comment"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {commentsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CommentThread postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function Composer() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [body, setBody] = useState("");
  const [attachedFile, setAttachedFile] = useState<{ id: string; name: string } | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.files.upload(file, { category: "creative" }),
    onSuccess: (file) => setAttachedFile({ id: file.id, name: file.name }),
    onError: (err: Error) => toast({ title: "Upload failed", description: err.message, variant: "destructive" }),
  });

  const postMutation = useMutation({
    mutationFn: () => api.waterCooler.post(body.trim(), { fileId: attachedFile?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["water-cooler"] });
      setBody("");
      setAttachedFile(null);
    },
    onError: (err: Error) => toast({ title: "Couldn't post", description: err.message, variant: "destructive" }),
  });

  return (
    <Card className="flex flex-col gap-3 p-4">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share something with the team…"
        rows={3}
      />
      {attachedFile && (
        <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs">
          <Paperclip className="size-3" />
          {attachedFile.name}
          <button type="button" onClick={() => setAttachedFile(null)} aria-label="Remove attachment">
            <X className="size-3" />
          </button>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
          <Paperclip className="size-3.5" />
          {uploadMutation.isPending ? "Uploading…" : "Attach a file"}
          <input
            type="file"
            className="hidden"
            disabled={uploadMutation.isPending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadMutation.mutate(file);
              e.target.value = "";
            }}
          />
        </label>
        <Button
          onClick={() => postMutation.mutate()}
          disabled={postMutation.isPending || (!body.trim() && !attachedFile)}
        >
          {postMutation.isPending ? "Posting…" : "Post"}
        </Button>
      </div>
    </Card>
  );
}

export function WaterCoolerPage() {
  const reduceMotion = useReducedMotion();
  const postsQuery = useQuery({ queryKey: ["water-cooler"], queryFn: api.waterCooler.list });

  return (
    <div className="flex max-w-2xl flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Water Cooler</h1>
        <p className="text-sm text-muted-foreground">
          The team's own space — shipped-project celebrations, plus whatever you want to share.
        </p>
      </div>

      <Composer />

      {postsQuery.isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {postsQuery.isError && <ErrorState message={postsQuery.error.message} onRetry={() => postsQuery.refetch()} />}

      {postsQuery.data && postsQuery.data.length === 0 && (
        <EmptyState
          icon={Coffee}
          title="Nothing here yet"
          description="Post something, or ship a project and it'll show up automatically."
        />
      )}

      {postsQuery.data && postsQuery.data.length > 0 && (
        <motion.div
          className="flex flex-col gap-3"
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {postsQuery.data.map((p) => (
            <motion.div
              key={p.id}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <PostCard post={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
