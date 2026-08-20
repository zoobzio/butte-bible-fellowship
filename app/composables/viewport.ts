import type { Ref } from "vue";

import { onBeforeUnmount, onMounted, ref } from "#imports";

/**
 * A reactive `matchMedia` result for `query`, kept in sync as the viewport
 * crosses the breakpoint.
 *
 * SSR and the first client render report `false` (there is no `matchMedia` on
 * the server), so callers should phrase the query desktop-first — e.g. a
 * `(max-width: …)` mobile query yields `false` on the server, rendering the
 * desktop layout, then flips on the client if the real viewport is narrow.
 * The listener is attached on mount and torn down on unmount.
 */
export const useMediaQuery = (query: string): Ref<boolean> => {
  const matches = ref(false);
  let mql: MediaQueryList | null = null;
  const update = () => {
    if (mql) matches.value = mql.matches;
  };

  onMounted(() => {
    mql = window.matchMedia(query);
    update();
    mql.addEventListener("change", update);
  });

  onBeforeUnmount(() => {
    mql?.removeEventListener("change", update);
    mql = null;
  });

  return matches;
};
