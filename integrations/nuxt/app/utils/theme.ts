import type { AppUnthemePatch } from "#imports";

type Bindings = Record<string, unknown>;

type Contexts = Record<string, Record<string, Bindings>>;

/**
 * One patch over another: the bindings of `over` win, token for token and
 * context for context, and whatever `under` binds that `over` does not
 * stays. The identity and the order are `under`'s: what is laid over a
 * theme does not rename it.
 */
export const overlay = (
  under: AppUnthemePatch,
  over: Pick<AppUnthemePatch, "tokens" | "modifiers">,
): AppUnthemePatch => {
  const merged: AppUnthemePatch = { ...under };
  if (under.tokens !== undefined || over.tokens !== undefined) {
    merged.tokens = { ...under.tokens, ...over.tokens };
  }
  if (under.modifiers !== undefined || over.modifiers !== undefined) {
    const modifiers: Contexts = {};
    for (const side of [under.modifiers, over.modifiers] as Contexts[]) {
      for (const [modifier, contexts] of Object.entries(side ?? {})) {
        const axis = (modifiers[modifier] ??= {});
        for (const [context, bindings] of Object.entries(contexts ?? {})) {
          axis[context] = { ...axis[context], ...bindings };
        }
      }
    }
    merged.modifiers = modifiers as AppUnthemePatch["modifiers"];
  }
  return merged;
};

export const transition = async (change: () => void | Promise<void>) => {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    await document.startViewTransition(change).updateCallbackDone;
    return;
  }
  await change();
};
