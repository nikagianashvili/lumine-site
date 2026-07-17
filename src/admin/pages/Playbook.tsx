import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { api, type PlaybookEntry } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function PlaybookPage() {
  const reduceMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const entriesQuery = useQuery({ queryKey: ["playbook"], queryFn: api.playbook.list });

  const filtered = useMemo(() => {
    const entries = entriesQuery.data ?? [];
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter((e) => e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q));
  }, [entriesQuery.data, search]);

  const selected = entriesQuery.data?.find((e) => e.id === selectedId);

  if (selected) {
    return <PlaybookDetail entry={selected} onBack={() => setSelectedId(null)} />;
  }

  if (creating) {
    return (
      <PlaybookEditor
        onCancel={() => setCreating(false)}
        onSaved={(id) => {
          setCreating(false);
          setSelectedId(id);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Playbook</h1>
          <p className="text-sm text-muted-foreground">SOPs and how-we-do-things, written down instead of remembered.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          New entry
        </Button>
      </div>

      <div className="relative w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search the playbook…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>

      {entriesQuery.isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      )}

      {entriesQuery.isError && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          The Playbook isn't set up yet — its database table hasn't been created.
        </p>
      )}

      {entriesQuery.data && filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {entriesQuery.data.length === 0 ? "Nothing written yet — add the first SOP." : "Nothing matches that search."}
        </p>
      )}

      {filtered.length > 0 && (
        <motion.div
          className="flex flex-col gap-2"
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
        >
          {filtered.map((e) => (
            <motion.button
              key={e.id}
              type="button"
              onClick={() => setSelectedId(e.id)}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="font-medium">{e.title}</span>
              <span className="line-clamp-1 text-sm text-muted-foreground">{e.body}</span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function PlaybookDetail({ entry, onBack }: { entry: PlaybookEntry; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => api.playbook.delete(entry.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook"] });
      onBack();
    },
  });

  if (editing) {
    return <PlaybookEditor entry={entry} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />;
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4 pt-6">
      <button type="button" onClick={onBack} className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        All entries
      </button>
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">{entry.title}</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <button
            type="button"
            aria-label="Delete entry"
            onClick={() => {
              if (window.confirm("Delete this entry?")) deleteMutation.mutate();
            }}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <Card className="p-5">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.body}</p>
      </Card>
    </div>
  );
}

function PlaybookEditor({
  entry,
  onCancel,
  onSaved,
}: {
  entry?: PlaybookEntry;
  onCancel: () => void;
  onSaved: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [error, setError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: () =>
      entry ? api.playbook.update(entry.id, { title, body }) : api.playbook.create({ title, body, tags: [] }),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["playbook"] });
      onSaved(saved.id);
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="flex max-w-2xl flex-col gap-4 pt-6">
      <h1 className="font-display text-2xl font-bold">{entry ? "Edit entry" : "New entry"}</h1>
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pb-title">Title</Label>
          <Input id="pb-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pb-body">Content</Label>
          <Textarea id="pb-body" value={body} onChange={(e) => setBody(e.target.value)} rows={12} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!title.trim()) {
                setError("Needs a title");
                return;
              }
              setError(null);
              saveMutation.mutate();
            }}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
