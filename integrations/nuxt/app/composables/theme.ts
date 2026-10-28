import type { ColorMode } from "#layers/bbf/app/types/theme";

import { computed, useUntheme } from "#imports";

export const useColorMode = () => {
  const untheme = useUntheme();

  const mode = computed<ColorMode>(() => untheme.config.input.color);

  const other = computed<ColorMode>(() =>
    mode.value === "dark" ? "light" : "dark",
  );

  const set = (next: ColorMode) => {
    untheme.swap("color", next);
  };

  const toggle = () => {
    set(other.value);
  };

  return { mode, other, set, toggle };
};
