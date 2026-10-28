import type { Context } from "@bbf/theme";
import type { Setting, SettingEntry } from "#layers/bbf/app/types/theme";

import { computed, useUntheme } from "#imports";
import { modifiers as contexts } from "@bbf/theme";
import { manifest } from "@bbf/theme/manifest";
import { transition } from "#layers/bbf/app/utils/theme";

const settings: readonly SettingEntry[] = manifest;

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
