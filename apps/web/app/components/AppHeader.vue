<script lang="ts">
import { NuxtLink } from "#components";
import {
  onBeforeUnmount,
  onMounted,
  useAppConfig,
  useNuxtApp,
  useTemplateRef,
} from "#imports";

import AppMobileNav from "~/components/AppMobileNav.vue";
import { useRouteLocale } from "~/composables/locale";
</script>

<script setup lang="ts">
defineOptions({ name: "AppHeader" });

const { header } = useAppConfig();
const { $t } = useNuxtApp();
const { localize } = useRouteLocale();

// The header wraps and scales with the viewport, so its height is measured
// and published as `--header-height`: what sticks under it reads where it
// ends.
const header$ = useTemplateRef<HTMLElement>("header");
let observer: ResizeObserver | null = null;

const publish = () => {
  if (!header$.value) return;
  document.documentElement.style.setProperty(
    "--header-height",
    `${header$.value.offsetHeight}px`,
  );
};

onMounted(() => {
  publish();
  if (!header$.value) return;
  observer = new ResizeObserver(publish);
  observer.observe(header$.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  document.documentElement.style.removeProperty("--header-height");
});
</script>

<template>
  <header ref="header" class="site-header">
    <NuxtLink :to="localize('/')" class="site-brand">
      <span class="site-brand-name">{{ $t.site.name() }}</span>
      <span class="site-brand-tag">{{ $t.site.tagline() }}</span>
    </NuxtLink>

    <nav class="site-nav" :aria-label="$t.navigation.label()">
      <NuxtLink
        v-for="link in header.links"
        :key="link.to"
        :to="localize(link.to)"
        class="site-nav-link"
      >
        {{ $t(link.label) }}
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
  /* The header alone runs the full viewport: the brand and the tabs stand
     at the window's edges rather than inside the site column. */
  padding: var(--space-5) calc(var(--site-gutter) / 2) var(--space-4);
  background: color-mix(in oklab, var(--surface) 88%, transparent);
  backdrop-filter: blur(var(--blur-sm)) saturate(1.2);
}

.site-header::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 1px;
  background: linear-gradient(
    108deg,
    var(--primary-500),
    var(--secondary-400) 52%,
    var(--tertiary-400)
  );
  opacity: 0.85;
}

.site-brand {
  display: grid;
  gap: var(--space-1);
  text-decoration: none;
}

.site-brand-name {
  font: var(--type-headline);
  font-family: var(--font-display);
  font-size: clamp(var(--title-size), 2.4vw, var(--headline-size));
  letter-spacing: var(--type-headline-letter-spacing);
  color: var(--on-surface-high-contrast);
}

.site-brand-tag {
  font: var(--type-title);
  font-family: var(--font-display);
  font-size: var(--label-size);
  font-style: italic;
  letter-spacing: var(--type-title-letter-spacing);
  color: var(--primary-medium-contrast);
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
  font-size: clamp(var(--label-size), 0.4vw + 0.8rem, var(--body-size));
  letter-spacing: var(--type-label-letter-spacing);
  color: var(--on-surface-muted-medium-contrast);
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

.site-nav-link.router-link-exact-active {
  color: var(--on-surface-high-contrast);
  font-weight: var(--weight-medium);
}

.site-nav-link.router-link-exact-active::after {
  transform: scaleX(1);
}

/* Small screens: the tabs give way to AppMobileNav's menu button. */
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
