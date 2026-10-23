<script lang="ts">
import { Icon, NuxtLink, Tabs } from "#components";
import { useSidebar } from "~/composables/navigation";
</script>

<script setup lang="ts">
defineOptions({ name: "AdminSidebar" });

const { tabs } = useSidebar();
</script>

<template>
  <aside class="admin-sidebar">
    <NuxtLink to="/" class="admin-brand">
      <Icon name="logo" class="admin-brand-logo" aria-hidden="true" />
      <span class="admin-brand-text">
        <span class="admin-brand-name">Butte Bible Fellowship</span>
        <span class="admin-brand-tag">Admin</span>
      </span>
    </NuxtLink>

    <nav class="admin-nav" aria-label="Sections">
      <Tabs v-bind="tabs" />
    </nav>
  </aside>
</template>

<style>
/* The sidebar keeps to the top of the window as the page scrolls, the
   brand over the sections, and never outgrows the window: its own
   content scrolls past that. */
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

/* The logo is drawn in currentColor, so it takes the theme's primary. */
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

/* The sections stand one under another. Each tab is a real link, and the
   one whose page is being read — or a page under it — is marked. The
   tabs' content panels hold nothing: the page is the content. */
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

/* Small screens: the sidebar is a bar across the top, the sections in a
   row under the brand. */
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
  .admin-nav .f-tabs-list {
    grid-auto-flow: column;
    justify-content: start;
    gap: var(--space-2);
  }
}
</style>
