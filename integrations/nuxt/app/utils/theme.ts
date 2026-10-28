export const transition = async (change: () => void | Promise<void>) => {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    await document.startViewTransition(change).updateCallbackDone;
    return;
  }
  await change();
};
