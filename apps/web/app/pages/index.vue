<script lang="ts">
import { ContentRenderer, NuxtLink } from "#components";
import { computed, createError, useHead, useT, definePageMeta } from "#imports";

import { useRouteLocale } from "~/composables/locale";
import { usePage } from "~/composables/page";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { data: page } = await usePage();
const { localize } = useRouteLocale();

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: useT().page.notFound() });
}

useHead(() => ({ title: page.value?.title }));

const hero = computed(() => page.value?.hero);
</script>

<template>
  <div v-if="page">
    <div v-if="hero" class="home-hero">
      <section class="home-hero-body">
        <div class="home-hero-content">
          <h1>
            {{ hero.tagline }}
            <em v-if="hero.highlight">{{ hero.highlight }}</em>
          </h1>
          <p v-if="hero.description">{{ hero.description }}</p>
          <NuxtLink v-if="hero.cta" :to="localize(hero.cta.to)" class="cta">
            {{ hero.cta.label }}
          </NuxtLink>
        </div>
      </section>
    </div>

    <section class="prose">
      <ContentRenderer
        :value="page"
        :components="MARKDOWN_COMPONENTS"
        :prose="false"
      />
    </section>
  </div>
</template>

<style>
.home-hero {
  position: relative;
  background: transparent;
}

/* The hero wash paints on a negative-z layer so the scroll-drawn arch
   track (also negative-z, appended later) reads on top of it. */
.home-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(
      circle at 14% 22%,
      color-mix(in oklab, var(--primary-container) 62%, transparent),
      transparent 58%
    ),
    radial-gradient(
      circle at 86% 88%,
      color-mix(in oklab, var(--tertiary-container) 42%, transparent),
      transparent 60%
    ),
    linear-gradient(
      color-mix(in oklab, var(--primary-container) 26%, transparent),
      var(--surface)
    );
}

[data-color="light"] .home-hero::before {
  background:
    radial-gradient(
      circle at 14% 22%,
      color-mix(in oklab, var(--primary-300) 52%, transparent),
      transparent 64%
    ),
    radial-gradient(
      circle at 86% 88%,
      color-mix(in oklab, var(--tertiary-300) 38%, transparent),
      transparent 64%
    ),
    linear-gradient(
      color-mix(in oklab, var(--primary-200) 50%, transparent),
      color-mix(in oklab, var(--surface) 55%, transparent)
    );
}

.home-hero-body {
  position: relative;
  z-index: 1;
  width: min(100% - clamp(var(--space-5), 8vw, var(--space-8)), 88ch);
  margin-inline: auto;
  padding-block: clamp(var(--space-8), 12vw, var(--space-10));
}

.home-hero-content {
  display: grid;
  justify-items: start;
  gap: var(--space-5);
}

.home-hero h1 {
  margin: 0;
  font-size: clamp(
    calc(var(--display-size) * 0.85),
    7.5vw,
    calc(var(--display-size) * 1.85)
  );
  line-height: 1.05;
}

.home-hero h1 em {
  display: block;
  color: var(--primary-medium-contrast);
}

.home-hero p {
  font: var(--type-title);
  font-family: var(--font-display);
  font-size: clamp(var(--title-size), 2.2vw, calc(var(--title-size) * 1.35));
  line-height: 1.6;
  color: var(--on-surface-medium-contrast);
  max-width: 44ch;
  margin: 0;
}

/* ---------- Motion — slow enough to feel like weather ---------------- */

@media (prefers-reduced-motion: no-preference) {
  .home-hero-content > * {
    animation: bbf-rise var(--duration-slow) var(--easing-enter) both;
  }
  .home-hero-content > *:nth-child(2) {
    animation-delay: calc(var(--delay-step) * 1.5);
  }
  .home-hero-content > *:nth-child(3) {
    animation-delay: calc(var(--delay-step) * 3);
  }
}

@keyframes bbf-rise {
  from {
    opacity: 0;
    transform: translateY(var(--space-3));
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
