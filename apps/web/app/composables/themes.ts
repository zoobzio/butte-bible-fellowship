import type { Entry } from "untheme/catalog";

import { computed, useState, useUntheme } from "#imports";
import { useCatalog } from "~/composables/catalog";
import { THEMES_KEY } from "~/constants/theme";

/** Runs a change as a view-transition cross-fade where the browser can. */
const transition = (change: () => void) => {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    document.startViewTransition(change);
    return;
  }
  change();
};

/**
 * The themes the catalog serves, and the one untheme has active. The list is
 * fetched on demand and shared app-wide; choosing a theme retrieves its
 * layer from the catalog and applies it. The untheme module records the
 * active theme's id in a cookie, which the theme plugin restores from.
 */
export const useThemes = () => {
  const untheme = useUntheme();
  const catalog = useCatalog();

  const themes = useState<Entry[]>(THEMES_KEY, () => []);

  const active = computed(() => untheme.config.theme.id);

  /* The whole manifest: the first page reports the total, which sizes the
     follow-up listing when more themes match than one page carries. */
  const load = async () => {
    if (themes.value.length > 0) {
      return;
    }
    const first = await catalog.list();
    if (first.entries.length >= first.total) {
      themes.value = first.entries;
      return;
    }
    const whole = await catalog.list({ limit: first.total });
    themes.value = whole.entries;
  };

  /* A miss leaves the active theme standing. */
  const choose = async (id: string) => {
    if (id === active.value) {
      return;
    }
    const layer = await catalog.get(id);
    if (!layer) {
      return;
    }
    transition(() => untheme.apply(layer));
  };

  return { themes, active, load, choose };
};
