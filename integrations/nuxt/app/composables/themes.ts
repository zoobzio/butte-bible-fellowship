import type { Theme, ThemeEntry } from "#layers/bbf/app/types/theme";

import { computed, useUntheme } from "#imports";
import { layers } from "@bbf/theme/layers";
import { transition } from "#layers/bbf/app/utils/theme";

/** The themes the build carries: the site's palette and every aurora theme, by name. */
const themes: ThemeEntry[] = [...layers].sort((a, b) =>
  a.name.localeCompare(b.name),
);

/**
 * The themes on offer, and the one active: the layers of the build, of which
 * the site's palette is the base. Choosing one loads its layer on demand and
 * applies it; the module persists the applied layer's id in a cookie so SSR
 * renders the choice made. The color scheme and the other settings are
 * modifiers beside it, and apply to every theme.
 */
export const useThemes = () => {
  const untheme = useUntheme();

  // The applied layer, or the base — the site's own palette — when none is.
  const active = computed<Theme>(
    () => (untheme.config.patch.id ?? untheme.schema.base.id) as Theme,
  );

  const choose = async (id: Theme) => {
    if (id === active.value) {
      return;
    }
    await transition(async () => {
      await untheme.select(id);
    });
  };

  return { themes, active, choose };
};
