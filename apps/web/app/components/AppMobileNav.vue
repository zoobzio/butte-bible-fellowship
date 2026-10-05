<script lang="ts">
import Menu from "@zoobzio/foundation/components/core/menu.vue";

import { Icon } from "#components";
import { useAppConfig, useT } from "#imports";
import { defineMenu } from "@zoobzio/foundation/definitions/menu";
import { useRouteLocale } from "~/composables/locale";
</script>

<script setup lang="ts">
const { header } = useAppConfig();
const t = useT();
const { localize } = useRouteLocale();

const menu = defineMenu(() => ({
  groups: [
    {
      key: "primary",
      items: header.links.map(({ label, to }) => ({
        label: t(label),
        link: { to: localize(to) },
      })),
    },
  ],
  align: "end" as const,
}));
</script>

<template>
  <div class="site-nav-mobile">
    <Menu v-bind="menu">
      <button type="button" :aria-label="t.navigation.open()">
        <Icon name="menu" class="icon" />
      </button>
    </Menu>
  </div>
</template>
