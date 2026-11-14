<script lang="ts">
import type { HomeHero } from "@bbf/schema/types";

import { NuxtLink } from "#components";

import { useHeroHeading, useHeroImage } from "~/composables/hero";
</script>

<script setup lang="ts">
defineOptions({ name: "HomeHero" });

/*
 * What the home page opens with, every part of it the page's own, as the
 * admin's settings write it: its words, where its button leads and its
 * picture. The heading is one line of text, and what is written between
 * asterisks in it (**like this**) is a span the styles draw as its
 * highlight.
 */
const { hero } = defineProps<{ hero: HomeHero }>();

const heading = useHeroHeading(() => hero);
const image = useHeroImage(() => hero);
</script>

<template>
  <div class="home-hero">
    <section class="home-hero-body">
      <div class="home-hero-content">
        <h1 class="page-title">
          <template v-for="(part, index) in heading" :key="index">
            <span v-if="part.highlight" class="home-hero-highlight">{{
              part.text
            }}</span>
            <template v-else>{{ part.text }}</template>
          </template>
        </h1>
        <p>{{ hero.description }}</p>
        <NuxtLink :to="hero.link" class="cta">
          {{ hero.action }}
        </NuxtLink>
      </div>
      <div class="home-hero-media arch">
        <img :src="image" alt="" />
      </div>
    </section>
  </div>
</template>

<style>
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

/* The highlight: on a line of its own, set apart as emphasis is. */
.home-hero-highlight {
  display: block;
  font-style: italic;
  color: var(--primary);
}

.home-hero p {
  font: var(--type-title);
  font-family: var(--font-display);
  font-size: clamp(var(--title-size), 2.2vw, calc(var(--title-size) * 1.35));
  line-height: 1.6;
  color: var(--on-surface);
  max-width: 44ch;
  margin: 0;
}

.home-hero-media {
  overflow: hidden;
  aspect-ratio: 4 / 5;
  padding: var(--space-2);
  border: 1px var(--stroke-solid)
    color-mix(in oklab, var(--primary) 45%, var(--rule));
  background: var(--surface-container);
  box-shadow: var(--elevation-low);
}

.home-hero-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 60rem) {
  .home-hero-body {
    grid-template-columns: minmax(0, 1fr);
  }
  .home-hero-media {
    max-width: 22rem;
  }
}

@media (prefers-reduced-motion: no-preference) {
  html:not([data-motion="reduced"]) .home-hero-content > *,
  html:not([data-motion="reduced"]) .home-hero-media {
    animation: bbf-rise var(--duration-slow) var(--easing-standard) both;
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
