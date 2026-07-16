import { useEffect, useState } from "react";

// Overview's dashboard is organized into rows (the sortable unit) that each
// hold one or two widgets (the show/hide unit). Row order and per-widget
// visibility persist per-browser in localStorage - no backend change needed
// for a real, working customization feature.
export type WidgetId = "leads-highlights" | "tasks-highlights" | "leads-chart" | "source-breakdown" | "activity-feed";
export type RowId = "highlights" | "insights" | "activity";

export const WIDGET_LABELS: Record<WidgetId, string> = {
  "leads-highlights": "Leads",
  "tasks-highlights": "Tasks",
  "leads-chart": "Leads over time",
  "source-breakdown": "Lead sources",
  "activity-feed": "Recent activity",
};

export const ROW_WIDGETS: Record<RowId, WidgetId[]> = {
  highlights: ["leads-highlights", "tasks-highlights"],
  insights: ["leads-chart", "source-breakdown"],
  activity: ["activity-feed"],
};

const DEFAULT_ROW_ORDER: RowId[] = ["highlights", "insights", "activity"];
const STORAGE_KEY = "lumine_admin_dashboard_layout_v1";

interface LayoutState {
  rowOrder: RowId[];
  hiddenWidgets: WidgetId[];
}

function loadLayout(): LayoutState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { rowOrder: DEFAULT_ROW_ORDER, hiddenWidgets: [] };
    const parsed = JSON.parse(raw) as Partial<LayoutState>;
    const known = new Set(parsed.rowOrder ?? []);
    // merge in any row introduced after a user's layout was saved, so
    // shipping a new row later doesn't silently vanish it for existing users
    const rowOrder = [...(parsed.rowOrder ?? []), ...DEFAULT_ROW_ORDER.filter((id) => !known.has(id))];
    return { rowOrder, hiddenWidgets: parsed.hiddenWidgets ?? [] };
  } catch {
    return { rowOrder: DEFAULT_ROW_ORDER, hiddenWidgets: [] };
  }
}

export function useDashboardLayout() {
  const [layout, setLayout] = useState<LayoutState>(loadLayout);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  return {
    rowOrder: layout.rowOrder,
    hiddenWidgets: layout.hiddenWidgets,
    isHidden: (id: WidgetId) => layout.hiddenWidgets.includes(id),
    setRowOrder: (rowOrder: RowId[]) => setLayout((l) => ({ ...l, rowOrder })),
    toggleWidget: (id: WidgetId) =>
      setLayout((l) => ({
        ...l,
        hiddenWidgets: l.hiddenWidgets.includes(id)
          ? l.hiddenWidgets.filter((h) => h !== id)
          : [...l.hiddenWidgets, id],
      })),
    reset: () => setLayout({ rowOrder: DEFAULT_ROW_ORDER, hiddenWidgets: [] }),
  };
}
