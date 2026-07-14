import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Engagement } from "@/lib/api";
import { RETAINER_TIERS } from "@/lib/retainerTiers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
          value={delivered}
          onChange={(e) => onDeliveredChange(Math.max(0, Number(e.target.value) || 0))}
          className="h-7 w-16 text-center"
        />
        <span>delivered of</span>
        <Input
          type="number"
          min={0}
          value={limit}
          onChange={(e) => onLimitChange(Math.max(0, Number(e.target.value) || 0))}
          className="h-7 w-16 text-center"
        />
      </div>
    </div>
  );
}

export function QuotaCard({ project }: { project: Engagement }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Engagement>) => api.engagements.update(project.id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["engagements"] }),
  });

  function applyTier(tierName: string) {
    const tier = RETAINER_TIERS.find((t) => t.name === tierName);
    updateMutation.mutate({
      retainer_tier: tierName,
      posters_limit: tier?.defaultPostersLimit ?? project.posters_limit ?? 0,
      videos_limit: tier?.defaultVideosLimit ?? project.videos_limit ?? 0,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retainer quota</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
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
              value={project.monthly_rate ?? ""}
              onChange={(e) => updateMutation.mutate({ monthly_rate: Number(e.target.value) || 0 })}
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
