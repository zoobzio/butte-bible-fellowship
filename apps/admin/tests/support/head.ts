import { useHead } from "#imports";

/**
 * What the page last set on the document's head: resolved, when it is a
 * function of the moment, as the head would resolve it.
 */
export const head = (): unknown => {
  const [input] = (useHead.mock.lastCall ?? []) as unknown[];
  return typeof input === "function" ? input() : input;
};
