<script lang="ts">
import { Icon, Menu } from "#components";
import { defineMenu, useNuxtApp } from "#imports";
import MenuLink from "~/components/MenuLink.vue";
import { useNavigation } from "~/composables/navigation";
</script>

<script setup lang="ts">
const { $t } = useNuxtApp();
const { links } = useNavigation();

const menu = defineMenu(() => ({
  groups: [
    {
      key: "primary",
      items: links.value.map(({ label, to }) => ({ label, link: { to } })),
    },
  ],
  align: "end" as const,
}));
</script>

<template>
  <div class="site-nav-mobile">
    <Menu v-bind="menu">
      <button type="button" :aria-label="$t.navigation.open()">
        <Icon name="menu" class="icon" />
      </button>
      <template #item="{ item, settings }">
        <MenuLink :item="item" :settings="settings" />
      </template>
    </Menu>
  </div>
</template>

<style>
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
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-md);
  background: transparent;
  color: var(--on-surface);
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
