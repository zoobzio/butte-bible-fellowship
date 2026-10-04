<script lang="ts">
import type { CommandOption } from "@zoobzio/foundation/types/core/command";
import type { Theme } from "~/types/theme";

import Command from "@zoobzio/foundation/components/core/command.vue";
import Dialog from "@zoobzio/foundation/components/core/dialog.vue";
import SegmentedControl from "@zoobzio/foundation/components/core/segmented-control.vue";

import { Icon } from "#components";
import { ref } from "#imports";
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

const open = ref(false);

const options: ThemeOption[] = themes.map(({ id, name }) => ({
  value: id,
  label: name,
}));

const dialog = defineDialog(() => ({
  title: "Appearance",
  description: "Pick a theme, then tune how the site looks and feels.",
  open: open.value,
  "onUpdate:open": (value) => {
    open.value = value;
  },
}));

// Picking the active theme again would clear a single selection; the
// selection is the service's, so an empty pick changes nothing.
const command = defineCommand(() => ({
  groups: [{ key: "themes", label: "Themes", options }],
  modelValue: options.filter((option) => option.value === active.value),
  placeholder: "Search themes…",
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
    aria-label="Choose a theme"
    aria-haspopup="dialog"
    @click="open = true"
  >
    <Icon name="palette" class="icon" />
  </button>
  <Dialog v-bind="dialog">
    <button
      type="button"
      class="theme-picker-close"
      aria-label="Close"
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
