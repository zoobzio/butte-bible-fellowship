<script lang="ts">
import type { Locale } from "@bbf/prose";

import { Icon, Menu } from "#components";
import { defineMenu, useNuxtApp } from "#imports";
import { useLanguages } from "~/composables/locale";
</script>

<script setup lang="ts">
const { $t } = useNuxtApp();
const { current, languages, choose } = useLanguages();

// Each language is a choice: picking one switches the site to it in place.
const menu = defineMenu(() => ({
  groups: [
    {
      key: "languages",
      items: languages.value.map(({ label, locale }) => ({ label, locale })),
    },
  ],
  side: "top" as const,
  align: "end" as const,
  onSelect: (item: { locale: Locale }) => choose(item.locale),
}));
</script>

<template>
  <Menu v-bind="menu">
    <button
      type="button"
      class="theme-toggle language-toggle"
      :aria-label="$t.language.open()"
    >
      <Icon name="languages" class="icon" />
      <span>{{ current }}</span>
    </button>
  </Menu>
</template>

<style>
/* The language button names the language beside its icon, so it widens
   the toggle button's square padding. */
.theme-toggle.language-toggle {
  padding-inline: var(--space-3);
}
</style>
