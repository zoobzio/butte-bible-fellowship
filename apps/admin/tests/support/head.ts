import { useHead } from "#imports";

export const head = (): unknown => {
  const [input] = (useHead.mock.lastCall ?? []) as unknown[];
  return typeof input === "function" ? input() : input;
};
