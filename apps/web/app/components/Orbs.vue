<script lang="ts">
import { computed, nextTick, useRoute, useTemplateRef, watch } from "#imports";

import { useRouteLocale } from "~/composables/locale";
import { useOrbDrift } from "~/composables/orbs";
</script>

<script setup lang="ts">
const route = useRoute();

const { path } = useRouteLocale();

const isHome = computed(() => path.value === "/");

const left = useTemplateRef<HTMLSpanElement>("left");
const right = useTemplateRef<HTMLSpanElement>("right");

const { schedule } = useOrbDrift({ left, right });

watch(
  () => route.path,
  () => nextTick(schedule),
);
</script>

<template>
  <div
    class="orb-field"
    :class="{ 'orb-field-home': isHome }"
    aria-hidden="true"
  >
    <span ref="left" class="orb orb-left" />
    <span ref="right" class="orb orb-right" />
  </div>
</template>

<style>
.orb-field {
  position: fixed;
  inset: 0;
  z-index: -2;
  overflow: hidden;
  pointer-events: none;
}

.orb {
  position: absolute;
  filter: blur(90px);
  will-change: transform;
  transition: transform 200ms linear;
}

/* Aurora shapes: irregular radii plus layered elliptical washes, so the
   edge never reads as a circle. */
.orb-left {
  left: -26vw;
  top: -30vh;
  width: min(112vw, 78rem);
  height: min(86vh, 54rem);
  transform-origin: 30% 40%;
  rotate: -14deg;
  border-radius: 62% 38% 54% 46% / 58% 44% 56% 42%;
  background:
    radial-gradient(
      ellipse 62% 74% at 32% 30%,
      color-mix(in oklab, var(--primary-container) 92%, transparent),
      transparent 72%
    ),
    radial-gradient(
      ellipse 78% 44% at 68% 62%,
      color-mix(in oklab, var(--primary-container) 58%, transparent),
      transparent 74%
    ),
    radial-gradient(
      ellipse 40% 60% at 12% 74%,
      color-mix(in oklab, var(--tertiary-container) 46%, transparent),
      transparent 76%
    );
  animation: orb-morph-a 46s var(--easing-standard) infinite alternate;
}

.orb-right {
  right: -30vw;
  bottom: -34vh;
  width: min(104vw, 72rem);
  height: min(80vh, 50rem);
  transform-origin: 70% 60%;
  rotate: 11deg;
  border-radius: 44% 56% 38% 62% / 52% 60% 40% 48%;
  background:
    radial-gradient(
      ellipse 70% 56% at 64% 66%,
      color-mix(in oklab, var(--secondary-container) 74%, transparent),
      transparent 74%
    ),
    radial-gradient(
      ellipse 46% 72% at 30% 40%,
      color-mix(in oklab, var(--secondary-container) 44%, transparent),
      transparent 76%
    ),
    radial-gradient(
      ellipse 58% 40% at 84% 24%,
      color-mix(in oklab, var(--tertiary-container) 38%, transparent),
      transparent 76%
    );
  animation: orb-morph-b 58s var(--easing-standard) infinite alternate;
}

@keyframes orb-morph-a {
  to {
    border-radius: 48% 52% 42% 58% / 46% 56% 44% 54%;
    rotate: -6deg;
  }
}

@keyframes orb-morph-b {
  to {
    border-radius: 56% 44% 60% 40% / 62% 42% 58% 38%;
    rotate: 4deg;
  }
}

[data-color="light"] .orb-left {
  background:
    radial-gradient(
      ellipse 62% 74% at 32% 30%,
      color-mix(in oklab, var(--primary-300) 66%, transparent),
      transparent 72%
    ),
    radial-gradient(
      ellipse 78% 44% at 68% 62%,
      color-mix(in oklab, var(--primary-200) 72%, transparent),
      transparent 74%
    ),
    radial-gradient(
      ellipse 40% 60% at 12% 74%,
      color-mix(in oklab, var(--tertiary-300) 34%, transparent),
      transparent 76%
    );
}

[data-color="light"] .orb-right {
  background:
    radial-gradient(
      ellipse 70% 56% at 64% 66%,
      color-mix(in oklab, var(--secondary-300) 52%, transparent),
      transparent 74%
    ),
    radial-gradient(
      ellipse 46% 72% at 30% 40%,
      color-mix(in oklab, var(--secondary-200) 62%, transparent),
      transparent 76%
    ),
    radial-gradient(
      ellipse 58% 40% at 84% 24%,
      color-mix(in oklab, var(--tertiary-300) 30%, transparent),
      transparent 76%
    );
}

@media (prefers-reduced-motion: reduce) {
  .orb {
    transition: none;
    animation: none;
  }
}
</style>
