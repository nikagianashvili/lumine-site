import { useRef, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import type { DeliverableComment } from "@portal/lib/api";
import { Button } from "@portal/components/ui/button";
import { formatTimecode } from "@portal/lib/format";
import { cn } from "@portal/lib/utils";

// Timecode-anchored proofing surface for a video deliverable. "Comment at
// current time" captures video.currentTime the instant it's clicked - no
// separate scrubbing-to-match-a-typed-timestamp step - and existing
// comments render as markers on a slim custom timeline so a reviewer can
// jump straight to the contested frame.
export function VideoProofer({
  url,
  comments,
  pendingTimecode,
  onPlaceTimecode,
}: {
  url: string;
  comments: DeliverableComment[];
  pendingTimecode: number | null;
  onPlaceTimecode: (seconds: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const timecoded = comments.filter((c) => c.timecode_seconds != null);

  function seekTo(seconds: number) {
    if (videoRef.current) videoRef.current.currentTime = seconds;
  }

  return (
    <div className="flex flex-col gap-2">
      <video
        ref={videoRef}
        src={url}
        controls
        className="w-full rounded-xl border border-border bg-black"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      />

      {duration > 0 && (
        <div className="relative h-2 w-full rounded-full bg-muted">
          {timecoded.map((c) => (
            <button
              key={c.id}
              type="button"
              title={`${formatTimecode(c.timecode_seconds!)} — ${c.body}`}
              onClick={() => seekTo(c.timecode_seconds!)}
              className={cn(
                "absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card shadow",
                c.resolved ? "bg-muted-foreground" : "bg-primary",
              )}
              style={{ left: `${(c.timecode_seconds! / duration) * 100}%` }}
            />
          ))}
          {pendingTimecode != null && (
            <span
              className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border-2 border-dashed border-primary bg-primary/30"
              style={{ left: `${(pendingTimecode / duration) * 100}%` }}
            />
          )}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onPlaceTimecode(currentTime)}
      >
        <MessageSquarePlus />
        Comment at {formatTimecode(currentTime)}
      </Button>
    </div>
  );
}
