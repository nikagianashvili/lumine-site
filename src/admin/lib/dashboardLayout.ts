import { useEffect, useState } from "react";

// The dashboard is a flat, freely-orderable list of widgets in a responsive
// grid (not fixed row groupings) - drag any widget to any position and the
// grid reflows. Order and per-widget visibility persist per-browser in
// localStorage - no backend change needed for a real, working customization
// feature.
export type WidgetId = "leads-highlights" | "tasks-highlights" | "leads-chart" | "source-breakdown" | "activity-feed";

export const WIDGET_LABELS: Record<WidgetId, string> = {
  "leads-highlights": "Leads",
  "tasks-highlights": "Tasks",
  "leads-chart": "Leads over time",
  "source-breakdown": "Lead sources",
  "activity-feed": "Recent activity",
};

// 2 = full width, 1 = half width (sm:grid-cols-2) - a widget keeps its own
// size wherever it's dragged, so the grid never looks broken mid-reorder.
export const WIDGET_SPAN: Record<WidgetId, 1 | 2> = {
  "leads-highlights": 1,
  "tasks-highlights": 1,
  "leads-chart": 1,
  "source-breakdown": 1,
  "activity-feed": 2,
};

const DEFAULT_ORDER: WidgetId[] = ["leads-highlights", "tasks-highlights", "leads-chart", "source-breakdown", "activity-feed"];
const STORAGE_KEY = "lumine_admin_dashboard_layout_v2";

interface LayoutState {
  order: WidgetId[];
  hiddenWidgets: WidgetId[];
}

const KNOWN_WIDGET_IDS = new Set<WidgetId>(Object.keys(WIDGET_LABELS) as WidgetId[]);

function loadLayout(): LayoutState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: DEFAULT_ORDER, hiddenWidgets: [] };
    const parsed = JSON.parse(raw) as Partial<LayoutState>;
    // drop any saved id that no longer maps to a real widget (one renamed
    // or removed since the layout was saved) - an unknown id would
    // otherwise render nothing but still occupy a grid slot
    const savedOrder = (parsed.order ?? []).filter((id) => KNOWN_WIDGET_IDS.has(id));
    const known = new Set(savedOrder);
    // merge in any widget introduced after a user's layout was saved, so
    // shipping a new one later doesn't silently vanish it for existing users
    const order = [...savedOrder, ...DEFAULT_ORDER.filter((id) => !known.has(id))];
    const hiddenWidgets = (parsed.hiddenWidgets ?? []).filter((id) => KNOWN_WIDGET_IDS.has(id));
    return { order, hiddenWidgets };
  } catch {
    return { order: DEFAULT_ORDER, hiddenWidgets: [] };
  }
}

export function useDashboardLayout() {
  const [layout, setLayout] = useState<LayoutState>(loadLayout);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  return {
    order: layout.order,
    hiddenWidgets: layout.hiddenWidgets,
    isHidden: (id: WidgetId) => layout.hiddenWidgets.includes(id),
    setOrder: (order: WidgetId[]) => setLayout((l) => ({ ...l, order })),
    toggleWidget: (id: WidgetId) =>
      setLayout((l) => ({
        ...l,
        hiddenWidgets: l.hiddenWidgets.includes(id)
          ? l.hiddenWidgets.filter((h) => h !== id)
          : [...l.hiddenWidgets, id],
      })),
    reset: () => setLayout({ order: DEFAULT_ORDER, hiddenWidgets: [] }),
  };
}
