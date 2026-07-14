import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Board } from "@/components/program/Board";
import { Spreadsheet } from "@/components/program/Spreadsheet";
import { CalendarView } from "@/components/program/CalendarView";
import { BandwidthView } from "@/components/program/BandwidthView";
import { TaskModal } from "@/components/program/TaskModal";

type View = "board" | "timeline" | "spreadsheet" | "calendar" | "bandwidth";

const VIEWS: { id: View; label: string }[] = [
  { id: "board", label: "Board" },
  { id: "timeline", label: "Timeline" },
  { id: "spreadsheet", label: "Spreadsheet" },
  { id: "calendar", label: "Calendar" },
  { id: "bandwidth", label: "Bandwidth" },
];

export function ProgramPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<View>("board");

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Program</h1>
          <p className="text-sm text-muted-foreground">Every task, one board.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="size-4" />
          Create task
        </Button>
      </div>

      <div className="flex w-fit gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors",
              view === v.id && "bg-primary text-primary-foreground",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "board" && <Board />}
      {view === "spreadsheet" && <Spreadsheet />}
      {view === "calendar" && <CalendarView />}
      {view === "bandwidth" && <BandwidthView />}
      {view === "timeline" && (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
          Timeline (Gantt) is next in the rebuild queue.
        </div>
      )}

      <TaskModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
