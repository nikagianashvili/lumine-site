import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Board } from "@/components/program/Board";
import { TaskModal } from "@/components/program/TaskModal";

// View tabs (Timeline/Spreadsheet/Calendar) are next in the rebuild queue —
// Board ships first since it's the one the original brief called out as the
// biggest lever (DOM-rebuild-per-change lag in the old vanilla version).
export function ProgramPage() {
  const [modalOpen, setModalOpen] = useState(false);

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
      <Board />
      <TaskModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
