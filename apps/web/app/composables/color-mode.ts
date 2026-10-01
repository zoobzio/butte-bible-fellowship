import type { Ref } from "vue";

import { readonly, useCookie, useState } from "#imports";

export type ColorMode = "light" | "dark";

const KEY = "color-mode";

/**
 * The active color scheme, shared app-wide through `useState` and persisted
 * in a cookie so SSR renders the visitor's choice. The layout binds it to
 * `data-color` on <html>, which is what @bbf/theme's dark block keys off.
 */
export const useColorMode = (): {
  mode: Readonly<Ref<ColorMode>>;
  set: (next: ColorMode) => void;
} => {
  const cookie = useCookie<ColorMode>(KEY, {
    default: () => "light",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  const mode = useState<ColorMode>(KEY, () => cookie.value);

  const set = (next: ColorMode) => {
    mode.value = next;
    cookie.value = next;
  };

  return { mode: readonly(mode), set };
};
