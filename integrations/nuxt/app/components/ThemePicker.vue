<script lang="ts">
import type { CommandOption } from "#imports";
import type { Theme } from "#layers/bbf/app/types/theme";

import { Command, Icon, Popover } from "#components";
import { defineCommand, definePopover, useNuxtApp } from "#imports";
import { useThemes } from "#layers/bbf/app/composables/themes";
</script>

<script setup lang="ts">
defineOptions({ name: "ThemePicker" });

type ThemeOption = CommandOption & { value: Theme };

const { $t } = useNuxtApp();
const { themes, active, choose } = useThemes();

const options: ThemeOption[] = themes.map(({ id, name }) => ({
  value: id,
  label: name,
}));

const popover = definePopover({ side: "top", align: "start" });

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
      />
    </template>
  </Popover>
</template>
