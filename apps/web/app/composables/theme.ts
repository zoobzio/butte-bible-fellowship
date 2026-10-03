import type { ColorMode } from "~/types/theme";

import { computed, useUntheme } from "#imports";

/**
 * The active color scheme: untheme's `color` modifier. The service holds the
 * selection in app-wide state, persists it in a cookie so SSR renders the
 * visitor's choice, and mirrors it onto <html> as `data-color`, which the
 * theme's dark block and the app's own scheme-specific rules key off.
 */
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
