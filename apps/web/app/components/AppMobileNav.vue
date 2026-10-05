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

<style>
/* The tabs collapse behind a menu button on small screens. */
.site-nav-mobile {
  display: none;
}

@media (max-width: 44rem) {
  .site-nav-mobile {
    display: block;
  }
}

.site-nav-mobile .f-dropdown-menu-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  border: 1px var(--stroke-solid) var(--outline-muted);
  border-radius: var(--shape-md);
  background: transparent;
  color: var(--on-surface-medium-contrast);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.site-nav-mobile .f-dropdown-menu-trigger:hover,
.site-nav-mobile .f-dropdown-menu-trigger[data-state="open"] {
  color: var(--on-surface-high-contrast);
  border-color: color-mix(in oklab, var(--primary) 65%, transparent);
}

.site-nav-mobile .icon {
  display: block;
  width: var(--space-5);
  height: var(--space-5);
}
</style>
