<script lang="ts">
import type { CommandOption } from "@zoobzio/foundation/types/core/command";
import type { Theme } from "~/types/theme";

import Command from "@zoobzio/foundation/components/core/command.vue";
import Popover from "@zoobzio/foundation/components/core/popover.vue";

import { Icon } from "#components";
import { useNuxtApp } from "#imports";
import { defineCommand } from "@zoobzio/foundation/definitions/command";
import { definePopover } from "@zoobzio/foundation/definitions/popover";
import { useThemes } from "~/composables/themes";
</script>

<script setup lang="ts">
type ThemeOption = CommandOption & { value: Theme };

const { themes, active, choose } = useThemes();

const { $t } = useNuxtApp();

const options: ThemeOption[] = themes.map(({ id, name }) => ({
  value: id,
  label: name,
}));

const popover = definePopover({ side: "top", align: "start" });

// Picking the active theme again would clear a single selection; the
// selection is the service's, so an empty pick changes nothing.
const command = defineCommand(() => ({
  groups: [{ key: "themes", label: $t.appearance.themes(), options }],
  modelValue: options.filter((option) => option.value === active.value),
  placeholder: $t.appearance.search(),
  "onUpdate:modelValue": ([option] = []) => {
    if (option) {
      choose(option.value);
    }
  },
}));
</script>

<template>
  <Popover v-bind="popover">
    <template #trigger>
      <button
        type="button"
        class="theme-toggle"
        :aria-label="$t.appearance.open()"
      >
        <Icon name="palette" class="icon" />
      </button>
    </template>
    <template #content>
      <Command
        v-bind="command"
        class="theme-picker"
        :aria-label="$t.appearance.themes()"
      >
        <template #inputIcon>
          <Icon name="search" class="icon" />
        </template>
      </Command>
    </template>
  </Popover>
</template>

<style>
/* A command palette in the design system's popover. The popover portals to
   body, so these rules could not be scoped. */

/* The command: a search field over the list, which scrolls in a height
   that holds as the search narrows it. */
.theme-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 18rem;
  max-width: 100%;
  height: min(
    24rem,
    var(--reka-popover-content-available-height) - var(--space-3) * 2
  );
}

.theme-picker .icon {
  display: block;
  flex: none;
  width: var(--space-4);
  height: var(--space-4);
}

.theme-picker > .f-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px var(--stroke-solid) var(--outline-muted);
  border-radius: var(--shape-md);
  color: var(--on-surface-muted-medium-contrast);
  transition: border-color var(--transition-fast);
}

.theme-picker > .f-group:focus-within {
  border-color: color-mix(in oklab, var(--primary) 65%, transparent);
}

.theme-picker .f-scroll-area-root {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.theme-picker .f-scroll-area-viewport {
  width: 100%;
  height: 100%;
}

.theme-picker .f-scroll-area-scrollbar {
  display: flex;
  width: var(--space-2);
  padding: 2px;
  touch-action: none;
  user-select: none;
}

.theme-picker .f-scroll-area-thumb {
  flex: 1;
  border-radius: var(--shape-full);
  background: var(--outline-muted);
}

/* The list is short enough to scroll back by hand. */
.theme-picker .f-scroll-area-root > .f-button {
  display: none;
}

.theme-picker .f-scroll-area-viewport .f-group {
  padding: var(--space-3);
  color: var(--on-surface-muted);
}
</style>
