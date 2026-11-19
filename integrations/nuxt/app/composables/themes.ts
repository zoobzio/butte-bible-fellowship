import type { Theme, ThemeEntry } from "#layers/bbf/app/types/theme";

import { computed, useUntheme } from "#imports";
import { layers } from "@bbf/theme/layers";
import { useAppearance } from "#layers/bbf/app/composables/appearance";
import { transition } from "#layers/bbf/app/utils/theme";

const themes: ThemeEntry[] = [...layers].sort((a, b) =>
  a.name.localeCompare(b.name),
);

export const useThemes = () => {
  const untheme = useUntheme();
  const { restore } = useAppearance();

  const active = computed<Theme>(
    () => (untheme.config.patch.id ?? untheme.schema.base.id) as Theme,
  );

  const choose = async (id: Theme) => {
    if (id === active.value) {
      return;
    }
    /*
     * A theme is applied as the build holds it. The site's own comes back
     * with what was set over it: its layer alone would drop that until the
     * next request.
     */
    await transition(async () => {
      await untheme.select(id);
      restore();
    });
  };

  return { themes, active, choose };
};
