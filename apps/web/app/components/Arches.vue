<script lang="ts">
import { useTemplateRef } from "#imports";

import { useArchLines } from "~/composables/arches";
</script>

<script setup lang="ts">
const track = useTemplateRef<HTMLDivElement>("track");
const svg = useTemplateRef<SVGSVGElement>("svg");
const pathA = useTemplateRef<SVGPathElement>("pathA");
const pathB = useTemplateRef<SVGPathElement>("pathB");

useArchLines({ track, svg, pathA, pathB });
</script>

<template>
  <div ref="track" class="arch-track" aria-hidden="true">
    <svg ref="svg" preserveAspectRatio="none" fill="none">
      <path
        ref="pathA"
        class="arch-line arch-line-a"
        vector-effect="non-scaling-stroke"
      />
      <path
        ref="pathB"
        class="arch-line arch-line-b"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  </div>
</template>

<style>
.arch-track {
  position: absolute;
  inset: 0 0 auto;
  z-index: -1;
  pointer-events: none;
}

.arch-track svg {
  display: block;
  width: 100%;
  height: 100%;
}

.arch-line {
  stroke-width: 1;
  stroke-linecap: round;
}

.arch-line-a {
  stroke: color-mix(in oklab, var(--primary) 45%, transparent);
}
.arch-line-b {
  stroke: color-mix(in oklab, var(--secondary) 32%, transparent);
}

[data-color="light"] .arch-line-a {
  stroke: color-mix(in oklab, var(--primary) 52%, transparent);
}
[data-color="light"] .arch-line-b {
  stroke: color-mix(in oklab, var(--secondary) 40%, transparent);
}

/* The track is absolutely positioned against the document. */
body {
  position: relative;
}
</style>
