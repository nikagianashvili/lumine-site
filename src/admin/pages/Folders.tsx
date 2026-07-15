import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Folder as FolderIcon, FolderOpen, Database } from "lucide-react";
import { api } from "@/lib/api";
import { HATS } from "@/lib/hats";
import { isMissingTableError } from "@/lib/errors";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { BackButton } from "@/components/ui/back-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { FileUploadButton } from "@/components/files/FileUploadButton";
import { FileList } from "@/components/files/FileList";

type Mode = "folders" | "library";

const MODES: { value: Mode; label: string }[] = [
  { value: "folders", label: "Folders" },
  { value: "library", label: "Creative Library" },
];

export function FoldersPage() {
  const [mode, setMode] = useState<Mode>("folders");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

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
    onError: (err: Error) => toast({ title: "Couldn't create folder", description: err.message, variant: "destructive" }),
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => api.folders.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setConfirmDeleteOpen(false);
      setSelectedFolderId(null);
    },
    onError: (err: Error) => toast({ title: "Couldn't delete folder", description: err.message, variant: "destructive" }),
  });

  if (selectedFolderId) {
    const folder = foldersQuery.data?.find((f) => f.id === selectedFolderId);
    return (
      <div className="flex flex-col gap-4 pt-6">
        <BackButton onClick={() => setSelectedFolderId(null)} label="All folders" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold">{folder?.name ?? "Folder"}</h1>
          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            className="text-xs text-muted-foreground transition-colors hover:text-destructive"
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
              isMissingTableError(filesQuery.error) ? (
                <p className="py-6 text-sm text-muted-foreground">
                  File storage isn't set up yet — the files table hasn't been created.
                </p>
              ) : (
                <ErrorState message={filesQuery.error.message} onRetry={() => filesQuery.refetch()} />
              )
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
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title="Delete this folder?"
          description="Files inside will be unfiled, not deleted."
          confirmLabel="Delete folder"
          pending={deleteFolderMutation.isPending}
          onConfirm={() => deleteFolderMutation.mutate(selectedFolderId)}
        />
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

      <SegmentedControl options={MODES} value={mode} onChange={setMode} />

      {mode === "folders" && (
        <>
          {/* a real form so Enter creates the folder, same as clicking */}
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (newFolderName.trim()) createFolderMutation.mutate(newFolderName.trim());
            }}
          >
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name…"
              className="w-64"
            />
            <Button type="submit" disabled={createFolderMutation.isPending}>
              <Plus className="size-4" />
              Create folder
            </Button>
          </form>

          {foldersQuery.isLoading && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          )}

          {foldersQuery.isError &&
            (isMissingTableError(foldersQuery.error) ? (
              <EmptyState
                icon={Database}
                title="Folders isn't set up yet"
                description="The folders table hasn't been created in the database."
              />
            ) : (
              <ErrorState message={foldersQuery.error.message} onRetry={() => foldersQuery.refetch()} />
            ))}

          {foldersQuery.data && foldersQuery.data.length === 0 && (
            <EmptyState
              icon={FolderOpen}
              title="No folders yet"
              description="Create one for brand assets, templates, or anything not tied to a project."
            />
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
            isMissingTableError(allFilesQuery.error) ? (
              <p className="py-6 text-sm text-muted-foreground">
                File storage isn't set up yet — the files table hasn't been created.
              </p>
            ) : (
              <ErrorState message={allFilesQuery.error.message} onRetry={() => allFilesQuery.refetch()} />
            )
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
