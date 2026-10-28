import type { Context } from "@bbf/theme";
import type { Setting, SettingEntry } from "#layers/bbf/app/types/theme";

import { computed, useUntheme } from "#imports";
import { modifiers as contexts } from "@bbf/theme";
import { manifest } from "@bbf/theme/manifest";
import { transition } from "#layers/bbf/app/utils/theme";

/** The settings the build carries: every modifier, in order. */
const settings: readonly SettingEntry[] = manifest;

/**
 * The settings beside the theme, and each one's selection: untheme's
 * modifiers — color scheme, vibrancy, contrast, text size, density, corner
 * radius, depth and motion. Each applies to every theme. Each selection is
 * held app-wide, persisted in a cookie so SSR renders the choice made, and
 * mirrored onto <html> as `data-<modifier>`.
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
