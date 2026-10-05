/** Runs a change as a view-transition cross-fade where the browser can. */
export const transition = (change: () => void) => {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    document.startViewTransition(change);
    return;
  }
  change();
};
