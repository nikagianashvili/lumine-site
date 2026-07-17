import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckSquare, UserPlus, MessageSquareText } from "lucide-react";
import { api, type Notification, type NotificationType } from "@/lib/api";
import type { DeepLinkTarget } from "@/lib/deepLink";
import { timeAgo } from "@/lib/format";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  task_assigned: CheckSquare,
  new_lead: UserPlus,
  new_comment: MessageSquareText,
};

function isDeepLinkTarget(value: Notification["target"]): value is DeepLinkTarget & Record<string, unknown> {
  return typeof value?.page === "string";
}

export function NotificationsPanel({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (target: DeepLinkTarget) => void;
}) {
  const queryClient = useQueryClient();
  // Same short-poll-while-open pattern as TeamChatPanel - a real feed
  // without standing up a Realtime subscription for what's still a small
  // team's occasional events.
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: api.notifications.list,
    refetchInterval: open ? 5000 : false,
  });
  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.notifications.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const markAllReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  function handleClick(n: Notification) {
    if (!n.read_at) markReadMutation.mutate(n.id);
    if (isDeepLinkTarget(n.target)) {
      onNavigate(n.target as unknown as DeepLinkTarget);
      onOpenChange(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent open={open}>
        <SheetHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}</SheetDescription>
            </div>
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" onClick={() => markAllReadMutation.mutate()}>
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-1 p-2">
          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="Nothing yet" description="Task assignments, new leads, and deliverable comments will show up here." />
          ) : (
            notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Bell;
              const clickable = isDeepLinkTarget(n.target);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-muted",
                    !clickable && "cursor-default",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      n.read_at ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn("truncate text-sm", n.read_at ? "text-foreground" : "font-medium text-foreground")}>
                        {n.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
                    </span>
                    {n.body && <span className="block truncate text-xs text-muted-foreground">{n.body}</span>}
                  </span>
                  {!n.read_at && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                </button>
              );
            })
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export function useUnreadNotificationCount() {
  const notificationsQuery = useQuery({ queryKey: ["notifications"], queryFn: api.notifications.list, refetchInterval: 30000 });
  return (notificationsQuery.data ?? []).filter((n) => !n.read_at).length;
}
