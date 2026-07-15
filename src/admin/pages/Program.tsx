import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Board } from "@/components/program/Board";
import { Spreadsheet } from "@/components/program/Spreadsheet";
import { CalendarView } from "@/components/program/CalendarView";
import { BandwidthView } from "@/components/program/BandwidthView";
import { TaskModal } from "@/components/program/TaskModal";

// No Timeline entry until a real Gantt exists — a shipped view switcher
// with a "coming soon" pane undercuts every view next to it.
type View = "board" | "spreadsheet" | "calendar" | "bandwidth";

const VIEWS: { value: View; label: string }[] = [
  { value: "board", label: "Board" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "calendar", label: "Calendar" },
  { value: "bandwidth", label: "Bandwidth" },
];

export function ProgramPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<View>("board");

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Program</h1>
          <p className="text-sm text-muted-foreground">Every task, one board.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="size-4" />
          Create task
        </Button>
      </div>

      <SegmentedControl options={VIEWS} value={view} onChange={setView} />

      {view === "board" && <Board onCreateTask={() => setModalOpen(true)} />}
      {view === "spreadsheet" && <Spreadsheet />}
      {view === "calendar" && <CalendarView />}
      {view === "bandwidth" && <BandwidthView />}

      <TaskModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
