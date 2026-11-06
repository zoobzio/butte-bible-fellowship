<script lang="ts">
import type { AppProsaryLocale, CommandOption } from "#imports";

import { Command, Icon, Popover } from "#components";
import { defineCommand, definePopover, useNuxtApp } from "#imports";
import { useLanguages } from "#layers/bbf/app/composables/locale";
</script>

<script setup lang="ts">
defineOptions({ name: "LanguagePicker" });

type LanguageOption = CommandOption & { value: AppProsaryLocale };

const { $t } = useNuxtApp();
const { languages, choose } = useLanguages();

const options: LanguageOption[] = languages.value.map(({ locale, label }) => ({
  value: locale,
  label,
}));

const popover = definePopover({ side: "bottom", align: "end" });

const command = defineCommand(() => ({
  groups: [{ key: "languages", label: $t.language.languages(), options }],
  modelValue: options.filter((option) =>
    languages.value.some(
      ({ locale, active }) => active && locale === option.value,
    ),
  ),
  placeholder: $t.language.search(),
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
        class="theme-toggle language-toggle"
        :aria-label="$t.language.open()"
      >
        <Icon name="languages" class="icon" />
      </button>
    </template>
    <template #content>
      <Command
        v-bind="command"
        class="language-picker"
        :aria-label="$t.language.languages()"
      />
    </template>
  </Popover>
</template>
