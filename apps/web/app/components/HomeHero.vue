<script lang="ts">
import { NuxtLink } from "#components";
import { useAppConfig, useNuxtApp } from "#imports";
</script>

<script setup lang="ts">
defineOptions({ name: "HomeHero" });

/*
 * What the home page opens with. Its words are the interface's own, so
 * they are messages, translated with the rest; its picture and where its
 * button leads are the app's config.
 */
const { $t } = useNuxtApp();
const { hero } = useAppConfig();
</script>

<template>
  <div class="home-hero">
    <section class="home-hero-body">
      <div class="home-hero-content">
        <h1 class="page-title">
          {{ $t.home.tagline() }}
          <em>{{ $t.home.highlight() }}</em>
        </h1>
        <p>{{ $t.home.description() }}</p>
        <NuxtLink :to="hero.to" class="cta">
          {{ $t.home.cta() }}
        </NuxtLink>
      </div>
      <div class="home-hero-media arch">
        <img :src="hero.image" alt="" />
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

.home-hero h1 em {
  display: block;
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
