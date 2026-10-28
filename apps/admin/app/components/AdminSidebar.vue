<script lang="ts">
import { Icon, NuxtLink, Tabs } from "#components";
import { useAuth, useNuxtApp } from "#imports";

import AccountPanel from "~/components/AccountPanel.vue";
import { useSidebar } from "~/composables/navigation";
</script>

<script setup lang="ts">
defineOptions({ name: "AdminSidebar" });

const { $t } = useNuxtApp();
const { tabs } = useSidebar();

const auth = useAuth();
</script>

<template>
  <aside class="admin-sidebar">
    <NuxtLink to="/" class="admin-brand">
      <Icon name="logo" class="admin-brand-logo" aria-hidden="true" />
      <span class="admin-brand-text">
        <span class="admin-brand-name">{{ $t.site.name() }}</span>
        <span class="admin-brand-tag">{{ $t.admin.site.tag() }}</span>
      </span>
    </NuxtLink>

    <nav class="admin-nav" :aria-label="$t.admin.navigation.label()">
      <Tabs v-bind="tabs" />
    </nav>

    <div v-if="auth.current" class="admin-account">
      <AccountPanel />
    </div>
  </aside>
</template>

<style>
.admin-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  width: 16rem;
  height: 100vh;
  height: 100dvh;
  padding: var(--space-6) var(--space-4);
  overflow-y: auto;
  background: var(--surface-container);
  border-right: 1px var(--stroke-solid) var(--rule);
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-2);
  text-decoration: none;
}

.admin-brand-logo {
  flex: none;
  display: block;
  width: var(--space-7);
  height: var(--space-7);
  color: var(--primary);
}

.admin-brand-text {
  display: grid;
  gap: var(--space-1);
}

.admin-brand-name {
  font: var(--type-title);
  font-family: var(--font-display);
  letter-spacing: var(--type-title-letter-spacing);
  color: var(--on-surface-high-contrast);
}

.admin-brand-tag {
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--primary);
}

.admin-nav .f-tabs-list {
  display: grid;
  gap: var(--space-1);
}

.admin-nav .f-tabs-trigger {
  display: block;
  padding: var(--space-2) var(--space-3);
  border: 0;
  border-radius: var(--shape-sm);
  background: transparent;
  color: var(--on-surface-muted);
  font: var(--type-body);
  font-weight: var(--weight-medium);
  letter-spacing: var(--type-label-letter-spacing);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background var(--transition-fast);
}

.admin-nav .f-tabs-trigger:hover {
  color: var(--on-surface-high-contrast);
  background: color-mix(in oklab, var(--primary-container) 40%, transparent);
}

.admin-nav .f-tabs-trigger[data-state="active"] {
  color: var(--on-primary-container);
  background: var(--primary-container);
}

.admin-nav .f-tabs-content {
  display: none;
}

.admin-account {
  margin-top: auto;
}

@media (max-width: 44rem) {
  .admin-sidebar {
    width: auto;
    height: auto;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    overflow: visible;
    border-right: 0;
    border-bottom: 1px var(--stroke-solid) var(--rule);
    z-index: 20;
  }
  .admin-account {
    display: none;
  }
  .admin-nav .f-tabs-list {
    grid-auto-flow: column;
    justify-content: start;
    gap: var(--space-2);
  }
}
</style>
