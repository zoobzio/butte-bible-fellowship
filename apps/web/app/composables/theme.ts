import type { ColorMode } from "~/types/theme";

import { readonly, computed, useCookie, useState } from "#imports";
import { COLOR_MODE_KEY } from "~/constants/theme";

/**
 * The active color scheme, shared app-wide through `useState` and persisted
 * in a cookie so SSR renders the visitor's choice. The layout binds it to
 * `data-color` on <html>, which is what @bbf/theme's dark block keys off.
 */
export const useColorMode = () => {
  const cookie = useCookie<ColorMode>(COLOR_MODE_KEY, {
    default: () => "light",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const mode = useState<ColorMode>(COLOR_MODE_KEY, () => cookie.value);

  const other = computed(() => (mode.value === "dark" ? "light" : "dark"));

  const set = (next: ColorMode) => {
    mode.value = next;
    cookie.value = next;
  };

  const toggle = () => {
    set(other.value);
  };

  return { mode: readonly(mode), other, set, toggle };
};
