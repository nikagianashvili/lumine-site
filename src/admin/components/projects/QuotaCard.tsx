import { useEffect, useState, type KeyboardEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Engagement } from "@/lib/api";
import { RETAINER_TIERS } from "@/lib/retainerTiers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

function blurOnEnter(e: KeyboardEvent<HTMLInputElement>) {
  if (e.key === "Enter") e.currentTarget.blur();
}

function QuotaBar({
  label,
  delivered,
  limit,
  onDeliveredChange,
  onLimitChange,
}: {
  label: string;
  delivered: number;
  limit: number;
  onDeliveredChange: (n: number) => void;
  onLimitChange: (n: number) => void;
}) {
  const over = limit > 0 && delivered > limit;
  const pct = limit > 0 ? Math.min(100, Math.round((delivered / limit) * 100)) : 0;

  // Local staging state, committed on blur - typing "10" into a number
  // input previously fired a PATCH per keystroke (1, then 10). The server
  // value (`delivered`/`limit` props) stays the source of truth; this just
  // buffers what's being typed until the field loses focus.
  const [deliveredInput, setDeliveredInput] = useState(String(delivered));
  const [limitInput, setLimitInput] = useState(String(limit));
  useEffect(() => setDeliveredInput(String(delivered)), [delivered]);
  useEffect(() => setLimitInput(String(limit)), [limit]);

  function commitDelivered() {
    const n = Math.max(0, Number(deliveredInput) || 0);
    setDeliveredInput(String(n));
    if (n !== delivered) onDeliveredChange(n);
  }
  function commitLimit() {
    const n = Math.max(0, Number(limitInput) || 0);
    setLimitInput(String(n));
    if (n !== limit) onLimitChange(n);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        {over && <span className="text-xs font-semibold uppercase text-destructive">{delivered - limit} over quota</span>}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", over ? "bg-destructive" : "bg-primary")} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Input
          type="number"
          min={0}
          value={deliveredInput}
          onChange={(e) => setDeliveredInput(e.target.value)}
          onBlur={commitDelivered}
          onKeyDown={blurOnEnter}
          className="h-7 w-16 text-center"
        />
        <span>delivered of</span>
        <Input
          type="number"
          min={0}
          value={limitInput}
          onChange={(e) => setLimitInput(e.target.value)}
          onBlur={commitLimit}
          onKeyDown={blurOnEnter}
          className="h-7 w-16 text-center"
        />
      </div>
    </div>
  );
}

export function QuotaCard({ project }: { project: Engagement }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Engagement>) => api.engagements.update(project.id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["engagements"] }),
    onError: (err: Error) => toast({ title: "Couldn't update quota", description: err.message, variant: "destructive" }),
  });

  function applyTier(tierName: string) {
    const tier = RETAINER_TIERS.find((t) => t.name === tierName);
    updateMutation.mutate({
      retainer_tier: tierName,
      posters_limit: tier?.defaultPostersLimit ?? project.posters_limit ?? 0,
      videos_limit: tier?.defaultVideosLimit ?? project.videos_limit ?? 0,
    });
  }

  const [rateInput, setRateInput] = useState(String(project.monthly_rate ?? ""));
  useEffect(() => setRateInput(String(project.monthly_rate ?? "")), [project.monthly_rate]);

  function commitRate() {
    const n = Math.max(0, Number(rateInput) || 0);
    setRateInput(String(n || ""));
    if (n !== (project.monthly_rate ?? 0)) updateMutation.mutate({ monthly_rate: n });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retainer quota</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Tier</Label>
            <Select value={project.retainer_tier ?? ""} onValueChange={applyTier}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a tier" />
              </SelectTrigger>
              <SelectContent>
                {RETAINER_TIERS.map((t) => (
                  <SelectItem key={t.name} value={t.name}>
                    {t.name} ({t.postersRange} posters, {t.videosRange} videos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="monthly-rate">Monthly rate (₾)</Label>
            <Input
              id="monthly-rate"
              type="number"
              min={0}
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              onBlur={commitRate}
              onKeyDown={blurOnEnter}
              placeholder="e.g. 1800"
            />
          </div>
        </div>
        <QuotaBar
          label="Posters"
          delivered={project.posters_delivered ?? 0}
          limit={project.posters_limit ?? 0}
          onDeliveredChange={(n) => updateMutation.mutate({ posters_delivered: n })}
          onLimitChange={(n) => updateMutation.mutate({ posters_limit: n })}
        />
        <QuotaBar
          label="Videos"
          delivered={project.videos_delivered ?? 0}
          limit={project.videos_limit ?? 0}
          onDeliveredChange={(n) => updateMutation.mutate({ videos_delivered: n })}
          onLimitChange={(n) => updateMutation.mutate({ videos_limit: n })}
        />
      </CardContent>
    </Card>
  );
}
