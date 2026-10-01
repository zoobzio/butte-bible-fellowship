<script lang="ts">
import { computed, nextTick, useRoute, useTemplateRef, watch } from "#imports";

import { useOrbDrift } from "~/composables/orbs";
</script>

<script setup lang="ts">
/**
 * Two drifting background orbs, adapted from the design pass's preview
 * script. The left orb travels slowly down with scroll, the right orb up —
 * small amplitude on purpose. Decorative only: aria-hidden, pointer-events
 * off in CSS, and motion is skipped entirely under prefers-reduced-motion.
 */

/** px of drift across the whole page, per the design pass. */
const TRAVEL = 190;

const route = useRoute();

// On the home page the orbs start below the hero (the design's
// .orb-field-home hook), so the hero keeps its own gradient. Route-driven
// rather than DOM-sniffed so it survives client-side navigation.
const isHome = computed(() => route.path === "/");

const left = useTemplateRef<HTMLSpanElement>("left");
const right = useTemplateRef<HTMLSpanElement>("right");

const { schedule } = useOrbDrift({ left, right, travel: TRAVEL });

// Navigation changes the page height (and resets scroll); repaint once the
// new page has settled.
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
