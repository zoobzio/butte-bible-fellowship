import type { Context } from "@bbf/theme";
import type { Setting, SettingEntry } from "~/types/theme";

import { computed, useUntheme } from "#imports";
import { modifiers as contexts } from "@bbf/theme";
import { manifest } from "@bbf/theme/manifest";
import { transition } from "~/utils/theme";

/** The settings the build carries: every modifier but `theme`, in order. */
const settings = manifest.filter(
  (modifier): modifier is SettingEntry => modifier.id !== "theme",
);

/**
 * The settings beside the theme, and each one's selection: untheme's other
 * modifiers — color scheme, vibrancy, contrast, text size, density, corner
 * radius, depth and motion. Like the theme, each selection is held app-wide,
 * persisted in a cookie so SSR renders the visitor's choice, and mirrored
 * onto <html> as `data-<modifier>`.
 */
export const useModifiers = () => {
  const untheme = useUntheme();

  const selection = computed(() => untheme.config.input);

  const set = (id: Setting, context: string) => {
    const known = contexts[id].some((candidate) => candidate === context);
    if (!known || context === selection.value[id]) {
      return;
    }
    transition(() => untheme.swap(id, context as Context<typeof id>));
  };

  return { settings, selection, set };
};
