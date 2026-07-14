import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type WaterCoolerPost } from "@/lib/api";
import { getSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const QUICK_REACTIONS = ["🎉", "🔥", "👏", "❤️", "😂"];

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function PostCard({ post }: { post: WaterCoolerPost }) {
  const session = getSession();
  const queryClient = useQueryClient();
  const myId = session?.user.id;

  const reactMutation = useMutation({
    mutationFn: (emoji: string) => api.waterCooler.react(post.id, emoji),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["water-cooler"] }),
  });

  return (
    <Card className={cn("p-4", post.type === "celebration" && "border-primary/30 bg-accent")}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">
          {post.type === "celebration" ? "Lumine" : post.team_members?.name || "Someone"}
        </span>
        <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
      </div>
      <p className="mt-1.5 text-sm">{post.body}</p>
      {post.file_url && (
        <a
          href={post.file_url}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 inline-block text-xs text-primary hover:underline"
        >
          {post.file_url}
        </a>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
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
      </div>
    </Card>
  );
}

export function WaterCoolerPage() {
  const queryClient = useQueryClient();
  const postsQuery = useQuery({ queryKey: ["water-cooler"], queryFn: api.waterCooler.list });
  const [body, setBody] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const postMutation = useMutation({
    mutationFn: () => api.waterCooler.post(body, fileUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["water-cooler"] });
      setBody("");
      setFileUrl("");
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="flex max-w-2xl flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Water Cooler</h1>
        <p className="text-sm text-muted-foreground">
          The team's own space — shipped-project celebrations, plus whatever you want to share.
        </p>
      </div>

      <Card className="flex flex-col gap-3 p-4">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share something with the team…"
          rows={3}
        />
        <Input
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="Link to a file (optional) — no upload yet, paste a URL"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end">
          <Button
            onClick={() => {
              if (!body.trim()) {
                setError("Write something first");
                return;
              }
              postMutation.mutate();
            }}
            disabled={postMutation.isPending}
          >
            {postMutation.isPending ? "Posting…" : "Post"}
          </Button>
        </div>
      </Card>

      {postsQuery.isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {postsQuery.isError && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Water Cooler isn't set up yet — its table hasn't been created in the database.
        </p>
      )}

      {postsQuery.data && postsQuery.data.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nothing here yet — post something, or ship a project and it'll show up automatically.
        </p>
      )}

      {postsQuery.data && postsQuery.data.length > 0 && (
        <div className="flex flex-col gap-3">
          {postsQuery.data.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
