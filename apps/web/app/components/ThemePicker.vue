<script lang="ts">
import type { CommandOption } from "@zoobzio/foundation/types/core/command";
import type { Theme } from "~/types/theme";

import Command from "@zoobzio/foundation/components/core/command.vue";
import Dialog from "@zoobzio/foundation/components/core/dialog.vue";
import SegmentedControl from "@zoobzio/foundation/components/core/segmented-control.vue";

import { Icon } from "#components";
import { ref, useNuxtApp } from "#imports";
import { defineCommand } from "@zoobzio/foundation/definitions/command";
import { defineDialog } from "@zoobzio/foundation/definitions/dialog";
import { defineSegmentedControl } from "@zoobzio/foundation/definitions/segmented-control";
import { useModifiers } from "~/composables/modifiers";
import { useThemes } from "~/composables/themes";
</script>

<script setup lang="ts">
type ThemeOption = CommandOption & { value: Theme };

const { themes, active, choose } = useThemes();
const { settings, selection, set } = useModifiers();

const { $t } = useNuxtApp();

const open = ref(false);

const options: ThemeOption[] = themes.map(({ id, name }) => ({
  value: id,
  label: name,
}));

const dialog = defineDialog(() => ({
  title: $t.appearance.title(),
  description: $t.appearance.description(),
  open: open.value,
  "onUpdate:open": (value) => {
    open.value = value;
  },
}));

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

const controls = settings.map(({ id, name, contexts }) => {
  const options = contexts.map((context) => ({
    value: context.id,
    label: context.name,
  }));
  return {
    id,
    name,
    control: defineSegmentedControl(() => ({
      options,
      modelValue: selection.value[id],
      required: true,
      "onUpdate:modelValue": (value) => {
        set(id, value);
      },
    })),
  };
});
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="$t.appearance.open()"
    aria-haspopup="dialog"
    @click="open = true"
  >
    <Icon name="palette" class="icon" />
  </button>
  <Dialog v-bind="dialog">
    <button
      type="button"
      class="theme-picker-close"
      :aria-label="$t.appearance.close()"
      @click="open = false"
    >
      <Icon name="x" class="icon" />
    </button>
    <div class="theme-picker">
      <Command v-bind="command" class="theme-picker-themes">
        <template #inputIcon>
          <Icon name="search" class="icon" />
        </template>
      </Command>
      <div class="theme-picker-settings">
        <div
          v-for="{ id, name, control } in controls"
          :key="id"
          class="theme-picker-setting"
        >
          <span :id="`theme-picker-${id}`" class="f-caption">{{ name }}</span>
          <SegmentedControl
            v-bind="control.value"
            :aria-labelledby="`theme-picker-${id}`"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style>
/* A command palette in the design system's dialog. The dialog portals to
   body, so these rules could not be scoped. */
.theme-picker-close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  display: inline-flex;
  padding: var(--space-2);
  border: 0;
  border-radius: var(--shape-full);
  background: transparent;
  color: var(--on-surface-muted-medium-contrast);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background var(--transition-fast);
}

.theme-picker-close:hover {
  color: var(--on-surface-high-contrast);
  background: color-mix(in oklab, var(--primary-container) 40%, transparent);
}

.theme-picker .icon,
.theme-picker-close .icon {
  display: block;
  flex: none;
  width: var(--space-4);
  height: var(--space-4);
}

/* Two thirds for the themes, one third for the settings beside them. */
.theme-picker {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: var(--space-5);
  min-height: 0;
}

/* The command: a search field over the list, which scrolls in the height
   the modal leaves it. */
.theme-picker-themes {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-height: 0;
}

.theme-picker-themes > .f-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px var(--stroke-solid) var(--outline-muted);
  border-radius: var(--shape-md);
  color: var(--on-surface-muted-medium-contrast);
  transition: border-color var(--transition-fast);
}

.theme-picker-themes > .f-group:focus-within {
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

/* The settings: a labelled button group per modifier. */
.theme-picker-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 0;
  padding-left: var(--space-5);
  border-left: 1px var(--stroke-solid) var(--outline-muted);
  overflow: hidden auto;
}

.theme-picker-setting {
  display: grid;
  gap: var(--space-1);
}

.theme-picker-setting .f-caption {
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted-medium-contrast);
}

/* Small screens: the settings drop below the themes, each scrolling in
   its own half. */
@media (max-width: 44rem) {
  .theme-picker {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--space-4);
  }
  .theme-picker-settings {
    padding: var(--space-4) 0 0;
    border-left: 0;
    border-top: 1px var(--stroke-solid) var(--outline-muted);
  }
}
</style>
