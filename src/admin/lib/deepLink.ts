import { createContext, useContext, useEffect, useRef } from "react";

// The admin app has no router - each top-level page owns its own
// `selectedId` state and only App.tsx knows which `Page` is active. Jumping
// straight to a client/project/playbook entry from the command palette needs
// a way to hand that id to a page that hasn't mounted yet. A tiny context
// (set once in App.tsx, consumed once by the destination page) does that
// without threading an extra prop through every page in the PAGES table.
export type DeepLinkTarget =
  | { page: "manage"; clientId: string }
  | { page: "projects"; engagementId: string }
  | { page: "playbook"; playbookId: string }
  | { page: "program"; taskQuery: string };

interface DeepLinkContextValue {
  target: DeepLinkTarget | null;
  clear: () => void;
}

export const DeepLinkContext = createContext<DeepLinkContextValue>({ target: null, clear: () => {} });

// Fires `onConsume` once when the pending deep link targets `page`, then
// clears it so navigating away and back to the page doesn't re-trigger it.
export function useDeepLink<T extends DeepLinkTarget["page"]>(
  page: T,
  onConsume: (target: Extract<DeepLinkTarget, { page: T }>) => void,
) {
  const { target, clear } = useContext(DeepLinkContext);
  const onConsumeRef = useRef(onConsume);
  onConsumeRef.current = onConsume;

  useEffect(() => {
    if (target && target.page === page) {
      onConsumeRef.current(target as Extract<DeepLinkTarget, { page: T }>);
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
}
