import type { Ref } from "#imports";

import { onBeforeRouteLeave, onBeforeUnmount, onMounted, ref } from "#imports";

/**
 * Asks before a page is left while it holds changes that are not saved:
 * `dirty` says whether it does. A move to another page of the app waits
 * on an answer: `asking` holds while the page's window asks, `leave` goes
 * on and `stay` keeps to the page. A move asked about while another waits
 * takes its place, and the first stays. A move between the pages under
 * this one leaves nothing behind, and is not asked about. The tab closed
 * or loaded again is left to the browser, which asks in a window and in
 * words of its own.
 */
export const useLeaveGuard = (dirty: Readonly<Ref<boolean>>) => {
  const asking = ref(false);

  /* What the move being asked about waits on. */
  let answer: ((leave: boolean) => void) | null = null;

  const settle = (leave: boolean) => {
    asking.value = false;
    answer?.(leave);
    answer = null;
  };

  const ask = (): boolean | Promise<boolean> => {
    if (!dirty.value) return true;
    settle(false);
    asking.value = true;
    return new Promise((resolve) => {
      answer = resolve;
    });
  };

  onBeforeRouteLeave(ask);

  const unload = (event: BeforeUnloadEvent) => {
    if (dirty.value) event.preventDefault();
  };

  onMounted(() => globalThis.addEventListener("beforeunload", unload));
  onBeforeUnmount(() => {
    globalThis.removeEventListener("beforeunload", unload);
    settle(false);
  });

  return { asking, leave: () => settle(true), stay: () => settle(false) };
};
