import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { api } from "@/lib/api";
import { HATS } from "@/lib/hats";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FileUploadButton({
  category,
  folderId,
  engagementId,
  clientId,
  queryKey,
}: {
  category: "creative" | "document";
  folderId?: string;
  engagementId?: string;
  clientId?: string;
  queryKey: unknown[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  // Optional - which hat this file belongs to, so it surfaces in the
  // Creative Library filter (Saba's LUTs, Lasha's UI components, etc).
  const [hat, setHat] = useState<string>("none");

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      api.files.upload(file, {
        category,
        folder_id: folderId,
        engagement_id: engagementId,
        client_id: clientId,
        skills_tags: hat !== "none" ? [hat] : [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {category === "creative" && (
          <Select value={hat} onValueChange={setHat}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="No hat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No hat</SelectItem>
              {HATS.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadMutation.mutate(file);
            e.target.value = "";
          }}
        />
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploadMutation.isPending}>
          <Upload className="size-4" />
          {uploadMutation.isPending ? "Uploading…" : "Upload"}
        </Button>
      </div>
      {error && <p className="max-w-48 text-right text-xs text-destructive">{error}</p>}
    </div>
  );
}
