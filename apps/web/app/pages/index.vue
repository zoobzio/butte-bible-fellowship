<script lang="ts">
import { ContentRenderer, NuxtLink } from "#components";
import {
  computed,
  createError,
  useHead,
  useNuxtApp,
  definePageMeta,
} from "#imports";

import SermonGrid from "~/components/SermonGrid.vue";
import { useRouteLocale } from "~/composables/locale";
import { usePage } from "~/composables/page";
import { useSermons } from "~/composables/sermons";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();

const { data: page } = await usePage();
const { localize } = useRouteLocale();

if (!page.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

useHead(() => ({ title: page.value?.title }));

const hero = computed(() => page.value?.hero);

const { data: sermons } = await useSermons();

// The three newest sermons close the page: the sermons page has the rest.
const recent = computed(() => sermons.value?.slice(0, 3) ?? []);
</script>

<template>
  <div v-if="page" class="home">
    <div v-if="hero" class="home-hero">
      <section class="home-hero-body">
        <div class="home-hero-content">
          <h1 class="page-title">
            {{ hero.tagline }}
            <em v-if="hero.highlight">{{ hero.highlight }}</em>
          </h1>
          <p v-if="hero.description">{{ hero.description }}</p>
          <NuxtLink v-if="hero.cta" :to="localize(hero.cta.to)" class="cta">
            {{ hero.cta.label }}
          </NuxtLink>
        </div>
        <div class="home-hero-media">
          <img v-if="hero.image" :src="hero.image" alt="" />
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

    <section v-if="recent.length" class="home-sermons">
      <h2>{{ $t.sermons.recent() }}</h2>
      <SermonGrid :sermons="recent">
        <NuxtLink :to="localize('/sermons')" class="cta">
          {{ $t.sermons.more() }}
        </NuxtLink>
      </SermonGrid>
    </section>
  </div>
</template>

<style>
/* The page keeps the site's measure, as every page does: the hero, the
   article and the sermons each fill it. */
.home {
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

.home .prose {
  width: auto;
  margin-inline: 0;
}

/* The content, and to its right the window its picture is in. */
.home-hero-body {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 22rem);
  align-items: center;
  gap: clamp(var(--space-7), 6vw, var(--space-9));
  padding-block: clamp(var(--space-8), 12vw, var(--space-10));
}

.home-hero-content {
  display: grid;
  justify-items: start;
  gap: var(--space-5);
}

.home-hero h1 {
  margin: 0;
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

/* The staff card's arched window, holding its shape with or without a
   picture: until the page names one, it stands empty in its place. */
.home-hero-media {
  overflow: hidden;
  aspect-ratio: 4 / 5;
  padding: var(--space-2);
  border: 1px var(--stroke-solid)
    color-mix(in oklab, var(--primary) 45%, var(--outline-muted));
  border-radius: 50% 50% var(--shape-sm) var(--shape-sm) / 34% 34%
    var(--shape-sm) var(--shape-sm);
  background: var(--surface-container);
}

/* The picture takes the window's shape: the same arch, inside the rim. */
.home-hero-media img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

/* No room for a column beside the content: the window follows it, no
   wider than it stood beside it. */
@media (max-width: 60rem) {
  .home-hero-body {
    grid-template-columns: minmax(0, 1fr);
  }
  .home-hero-media {
    max-width: 22rem;
  }
}

/* The article's own padding has already set the sermons off from it. */
.home-sermons h2 {
  margin-top: 0;
}

.home-sermons .sermon-grid {
  margin: var(--space-6) 0 0;
}

/* ---------- Motion — slow enough to feel like weather ---------------- */

@media (prefers-reduced-motion: no-preference) {
  .home-hero-content > *,
  .home-hero-media {
    animation: bbf-rise var(--duration-slow) var(--easing-enter) both;
  }
  .home-hero-content > *:nth-child(2) {
    animation-delay: calc(var(--delay-step) * 1.5);
  }
  .home-hero-content > *:nth-child(3) {
    animation-delay: calc(var(--delay-step) * 3);
  }
  .home-hero-media {
    animation-delay: calc(var(--delay-step) * 4.5);
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
