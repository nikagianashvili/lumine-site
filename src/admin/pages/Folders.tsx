import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Folder as FolderIcon, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { HATS } from "@/lib/hats";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadButton } from "@/components/files/FileUploadButton";
import { FileList } from "@/components/files/FileList";
import { cn } from "@/lib/utils";

type Mode = "folders" | "library";

export function FoldersPage() {
  const [mode, setMode] = useState<Mode>("folders");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const queryClient = useQueryClient();

  const foldersQuery = useQuery({ queryKey: ["folders"], queryFn: api.folders.list });
  const filesQuery = useQuery({
    queryKey: ["files", "folder", selectedFolderId],
    queryFn: () => api.files.list({ folder_id: selectedFolderId ?? undefined }),
    enabled: !!selectedFolderId,
  });

  const createFolderMutation = useMutation({
    mutationFn: (name: string) => api.folders.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setNewFolderName("");
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => api.folders.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setSelectedFolderId(null);
    },
  });

  if (selectedFolderId) {
    const folder = foldersQuery.data?.find((f) => f.id === selectedFolderId);
    return (
      <div className="flex flex-col gap-4 pt-6">
        <button
          type="button"
          onClick={() => setSelectedFolderId(null)}
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All folders
        </button>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">{folder?.name ?? "Folder"}</h1>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Delete this folder? Files inside will be unfiled, not deleted.")) {
                deleteFolderMutation.mutate(selectedFolderId);
              }
            }}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Delete folder
          </button>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Files</CardTitle>
            <FileUploadButton
              category="creative"
              folderId={selectedFolderId}
              queryKey={["files", "folder", selectedFolderId]}
            />
          </CardHeader>
          <div className="px-5 pb-5">
            {filesQuery.isError ? (
              <p className="text-sm text-muted-foreground">File storage isn't set up yet.</p>
            ) : (
              <FileList
                files={filesQuery.data ?? []}
                queryKey={["files", "folder", selectedFolderId]}
                emptyLabel="No files yet — upload the first one."
                isLoading={filesQuery.isLoading}
              />
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Folders</h1>
        <p className="text-sm text-muted-foreground">
          Non-project material. Project files live on each project's own page.
        </p>
      </div>

      <div className="flex w-fit gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
        {(["folders", "library"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors",
              mode === m && "bg-primary text-primary-foreground",
            )}
          >
            {m === "folders" ? "Folders" : "Creative Library"}
          </button>
        ))}
      </div>

      {mode === "folders" && (
        <>
          <div className="flex gap-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name…"
              className="w-64"
            />
            <Button
              onClick={() => newFolderName.trim() && createFolderMutation.mutate(newFolderName.trim())}
              disabled={createFolderMutation.isPending}
            >
              <Plus className="size-4" />
              Create folder
            </Button>
          </div>

          {foldersQuery.isLoading && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          )}

          {foldersQuery.isError && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Folders aren't set up yet — the database table hasn't been created.
            </p>
          )}

          {foldersQuery.data && foldersQuery.data.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No folders yet — create one for brand assets, templates, or anything not tied to a project.
            </p>
          )}

          {foldersQuery.data && foldersQuery.data.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {foldersQuery.data.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFolderId(f.id)}
                  className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <FolderIcon className="size-5 text-primary" />
                  <span className="font-medium">{f.name}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {mode === "library" && <CreativeLibrary />}
    </div>
  );
}

// Filterable by hat/teammate across every creative file, wherever it lives
// (a project or an account-level folder) - the spec's "Creative Library
// within Folders," not a separate destination.
function CreativeLibrary() {
  const [hatFilter, setHatFilter] = useState<string>("all");
  const allFilesQuery = useQuery({ queryKey: ["files", "creative-all"], queryFn: () => api.files.list({ category: "creative" }) });

  const filtered = useMemo(() => {
    const files = allFilesQuery.data ?? [];
    if (hatFilter === "all") return files;
    return files.filter((f) => f.skills_tags?.includes(hatFilter));
  }, [allFilesQuery.data, hatFilter]);

  return (
    <div className="flex flex-col gap-4">
      <Select value={hatFilter} onValueChange={setHatFilter}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All hats</SelectItem>
          {HATS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card>
        <div className="px-5 py-3">
          {allFilesQuery.isError ? (
            <p className="py-6 text-sm text-muted-foreground">File storage isn't set up yet.</p>
          ) : (
            <FileList
              files={filtered}
              queryKey={["files", "creative-all"]}
              emptyLabel="Nothing tagged with a hat yet."
              isLoading={allFilesQuery.isLoading}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
