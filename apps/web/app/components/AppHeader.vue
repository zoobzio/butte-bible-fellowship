<script lang="ts">
import { Icon, NuxtLink } from "#components";
import {
  onBeforeUnmount,
  onMounted,
  useAppConfig,
  useNuxtApp,
  useTemplateRef,
} from "#imports";

import AppMobileNav from "~/components/AppMobileNav.vue";
import { useRouteLocale } from "~/composables/locale";
import { isWithin } from "~/utils/navigation";
</script>

<script setup lang="ts">
defineOptions({ name: "AppHeader" });

const { header } = useAppConfig();
const { $t } = useNuxtApp();
const { path, localize } = useRouteLocale();

// The header wraps and scales with the viewport, so its height is measured
// and published as `--header-height`: what sticks under it reads where it
// ends. The ref is not named `header`: that is the config above, and a
// production build would hand the element to it instead.
const header$ = useTemplateRef<HTMLElement>("root");
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
  <header ref="root" class="site-header">
    <NuxtLink :to="localize('/')" class="site-brand">
      <Icon name="logo" class="site-brand-logo" aria-hidden="true" />
      <span class="site-brand-text">
        <span class="site-brand-name">{{ $t.site.name() }}</span>
        <span class="site-brand-tag">{{ $t.site.tagline() }}</span>
      </span>
    </NuxtLink>

    <nav class="site-nav" :aria-label="$t.navigation.label()">
      <NuxtLink
        v-for="link in header.links"
        :key="link.to"
        :to="localize(link.to)"
        class="site-nav-link"
        :data-active="isWithin(path, link.to) ? '' : undefined"
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
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
}

/* The logo is drawn in currentColor, so it takes the theme's primary and
   follows it as the theme changes. It is a square of the brand's height:
   the name and tagline beside it, as the design system measures them. */
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

/* The tab of the page being read, or of the page that one is under: an
   event's page keeps the events tab marked. */
.site-nav-link[data-active] {
  color: var(--on-surface-high-contrast);
  font-weight: var(--weight-medium);
}

.site-nav-link[data-active]::after {
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
