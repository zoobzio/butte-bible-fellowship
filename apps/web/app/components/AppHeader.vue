<script lang="ts">
import { Icon, NuxtLink } from "#components";
import { useNuxtApp, useTemplateRef } from "#imports";

import AppMobileNav from "~/components/AppMobileNav.vue";
import { useHeaderHeight, useNavigation } from "~/composables/navigation";
</script>

<script setup lang="ts">
defineOptions({ name: "AppHeader" });

const { $t } = useNuxtApp();
const { home, links } = useNavigation();

// Do not name this ref `header`. A production build resolves that name to a config.
useHeaderHeight(useTemplateRef<HTMLElement>("root"));
</script>

<template>
  <header ref="root" class="site-header">
    <NuxtLink :to="home" class="site-brand">
      <Icon name="logo" class="site-brand-logo" aria-hidden="true" />
      <span class="site-brand-text">
        <span class="site-brand-name">{{ $t.site.name() }}</span>
        <span class="site-brand-tag">{{ $t.site.tagline() }}</span>
      </span>
    </NuxtLink>

    <nav class="site-nav" :aria-label="$t.navigation.label()">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="site-nav-link"
        :data-active="link.active ? '' : undefined"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>

    <AppMobileNav />
  </header>
</template>

<style>
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4) var(--space-6);
  padding: var(--space-5) calc(var(--site-gutter) / 2) var(--space-4);
  background: color-mix(in oklab, var(--surface) 88%, transparent);
  backdrop-filter: blur(var(--blur-sm)) saturate(1.2);
  box-shadow: var(--elevation-low);
}

.site-header::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 1px;
  background: var(--gradient-signature);
  opacity: 0.85;
}

.site-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
}

.site-brand-logo {
  flex: none;
  display: block;
  width: var(--brand-height);
  height: var(--brand-height);
  color: var(--primary);
}

.site-brand-text {
  display: grid;
  gap: var(--space-1);
}

.site-brand-name {
  font: var(--type-headline);
  font-family: var(--font-display);
  font-size: var(--brand-name-size);
  letter-spacing: var(--type-headline-letter-spacing);
  color: var(--on-surface-high-contrast);
}

.site-brand-tag {
  font: var(--type-title);
  font-family: var(--font-display);
  font-size: var(--label-size);
  font-style: italic;
  letter-spacing: var(--type-title-letter-spacing);
  color: var(--primary);
}

.site-brand:hover .site-brand-name {
  color: var(--primary-high-contrast);
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
  gap: var(--space-2) var(--space-5);
}

.site-nav-link {
  position: relative;
  padding: var(--space-2) 0;
  font-size: clamp(
    var(--label-size),
    calc(var(--label-size) * 0.9 + 0.4vw),
    var(--body-size)
  );
  letter-spacing: var(--type-label-letter-spacing);
  color: var(--on-surface-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.site-nav-link::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 2px;
  background: var(--primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-base);
}

.site-nav-link:hover {
  color: var(--on-surface-high-contrast);
}

.site-nav-link:hover::after {
  transform: scaleX(1);
}

.site-nav-link[data-active] {
  color: var(--on-surface-high-contrast);
  font-weight: var(--weight-medium);
}

.site-nav-link[data-active]::after {
  transform: scaleX(1);
}

@media (max-width: 44rem) {
  .site-header {
    align-items: flex-start;
    padding-block: var(--space-4) var(--space-3);
  }
  .site-nav {
    display: none;
  }
}
</style>
