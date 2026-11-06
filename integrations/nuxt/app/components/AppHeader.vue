<script lang="ts">
import { Icon, NuxtLink } from "#components";
import { useNuxtApp, useTemplateRef } from "#imports";

import AppMobileNav from "#layers/bbf/app/components/AppMobileNav.vue";
import ColorMode from "#layers/bbf/app/components/ColorMode.vue";
import LanguagePicker from "#layers/bbf/app/components/LanguagePicker.vue";
import ThemePicker from "#layers/bbf/app/components/ThemePicker.vue";
import ThemeSettings from "#layers/bbf/app/components/ThemeSettings.vue";
import {
  useHeaderHeight,
  useNavigation,
} from "#layers/bbf/app/composables/navigation";
</script>

<script setup lang="ts">
defineOptions({ name: "AppHeader" });

/* What an app adds at the right end of the bar: the admin's account menu. */
defineSlots<{ default?: () => unknown }>();

const { $t } = useNuxtApp();
const { home, tagline, links } = useNavigation();

// Do not name this ref `header`. A production build resolves that name to a config.
useHeaderHeight(useTemplateRef<HTMLElement>("root"));
</script>

<template>
  <header ref="root" class="site-header">
    <NuxtLink :to="home" class="site-brand">
      <Icon name="logo" class="site-brand-logo" aria-hidden="true" />
      <span class="site-brand-text">
        <span class="site-brand-name">{{ $t.site.name() }}</span>
        <span class="site-brand-tag">{{ tagline }}</span>
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

    <div class="site-actions">
      <div
        class="site-controls"
        role="group"
        :aria-label="$t.appearance.label()"
      >
        <ColorMode />
        <ThemePicker />
        <ThemeSettings />
        <LanguagePicker />
      </div>
      <slot />
      <AppMobileNav />
    </div>
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
  width: var(--space-7);
  height: var(--space-7);
  color: var(--primary);
}

.site-brand-text {
  display: grid;
  gap: var(--space-1);
}

.site-brand-name {
  font: var(--type-title);
  font-family: var(--font-display);
  letter-spacing: var(--type-title-letter-spacing);
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

/* The links follow the brand; the controls take the far end. */
.site-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
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

.site-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2) var(--space-3);
  margin-left: auto;
}

.site-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

@media (max-width: 44rem) {
  .site-header {
    padding-block: var(--space-4) var(--space-3);
  }
  .site-nav {
    display: none;
  }
  /* The actions take a row of their own under the brand. */
  .site-actions {
    flex: 1 1 100%;
  }
}
</style>
