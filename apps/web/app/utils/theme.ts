/**
 * Runs a change as a view-transition cross-fade where the browser can. The
 * fade waits for an async change, such as a theme loaded on demand.
 */
export const transition = async (change: () => void | Promise<void>) => {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    await document.startViewTransition(change).updateCallbackDone;
    return;
  }
  await change();
};
