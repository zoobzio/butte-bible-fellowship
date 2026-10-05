<script lang="ts">
import Menu from "@zoobzio/foundation/components/core/menu.vue";

import { Icon } from "#components";
import { useLocale, useT } from "#imports";
import { defineMenu } from "@zoobzio/foundation/definitions/menu";
import { useRouteLocale } from "~/composables/locale";
import { joinLocalePath, languageName } from "~/utils/locale";
</script>

<script setup lang="ts">
const t = useT();
const { locales } = useLocale();
const { locale, path } = useRouteLocale();

// Each language is a link to the page being read, in that language.
const menu = defineMenu(() => ({
  groups: [
    {
      key: "languages",
      items: locales.map((option) => ({
        label: languageName(option),
        link: { to: joinLocalePath(option, path.value) },
      })),
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
      :aria-label="t.language.open()"
    >
      <Icon name="languages" class="icon" />
      <span>{{ languageName(locale) }}</span>
    </button>
  </Menu>
</template>
