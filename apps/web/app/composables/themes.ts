import type { Theme, ThemeEntry } from "~/types/theme";

import { computed, useUntheme } from "#imports";
import { manifest } from "@bbf/theme/manifest";

/** The themes the build carries: the `theme` modifier's contexts, by name. */
const themes: ThemeEntry[] = [
  ...manifest.find((modifier) => modifier.id === "theme")!.contexts,
].sort((a, b) => a.name.localeCompare(b.name));

/** Runs a change as a view-transition cross-fade where the browser can. */
const transition = (change: () => void) => {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    document.startViewTransition(change);
    return;
  }
  change();
};

/**
 * The themes on offer, and the one active: untheme's `theme` modifier, whose
 * contexts are the site's palette and every aurora theme. Like the color
 * scheme, the selection is held app-wide, persisted in a cookie so SSR
 * renders the visitor's choice, and mirrored onto <html> as `data-theme`.
 */
export const useThemes = () => {
  const untheme = useUntheme();

  const active = computed<Theme>(() => untheme.config.input.theme);

  const choose = (id: Theme) => {
    if (id === active.value) {
      return;
    }
    transition(() => untheme.swap("theme", id));
  };

  return { themes, active, choose };
};
