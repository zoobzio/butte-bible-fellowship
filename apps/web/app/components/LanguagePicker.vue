<script lang="ts">
import Menu from "@zoobzio/foundation/components/core/menu.vue";

import { Icon } from "#components";
import { useNuxtApp } from "#imports";
import { defineMenu } from "@zoobzio/foundation/definitions/menu";
import { useLanguages } from "~/composables/locale";
</script>

<script setup lang="ts">
const { $t } = useNuxtApp();
const { current, languages } = useLanguages();

// Each language is a link to the page being read, in that language.
const menu = defineMenu(() => ({
  groups: [
    {
      key: "languages",
      items: languages.value.map(({ label, to }) => ({ label, link: { to } })),
    },
  ],
  side: "top" as const,
  align: "end" as const,
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
