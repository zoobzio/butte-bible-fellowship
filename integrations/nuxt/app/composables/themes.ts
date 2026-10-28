import type { Theme, ThemeEntry } from "#layers/bbf/app/types/theme";

import { computed, useUntheme } from "#imports";
import { layers } from "@bbf/theme/layers";
import { transition } from "#layers/bbf/app/utils/theme";

const themes: ThemeEntry[] = [...layers].sort((a, b) =>
  a.name.localeCompare(b.name),
);

export const useThemes = () => {
  const untheme = useUntheme();

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
