import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientsTable } from "@/components/manage/ClientsTable";
import { NewClientModal } from "@/components/manage/NewClientModal";
import { ClientDetail } from "@/components/manage/ClientDetail";
import { useDeepLink } from "@/lib/deepLink";

export function ManagePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useDeepLink("manage", (target) => setSelectedId(target.clientId));

  if (selectedId) {
    return <ClientDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Manage</h1>
          <p className="text-sm text-muted-foreground">Every client and lead, one pipeline.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="size-4" />
          New client
        </Button>
      </div>
      <ClientsTable onSelect={setSelectedId} />
      <NewClientModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
