<script lang="ts">
import { useTemplateRef } from "#imports";

import { useArchLines } from "~/composables/arches";
</script>

<script setup lang="ts">
/**
 * Scroll-drawn arch lines for the home page, adapted from the design
 * pass's preview script. Geometry lives in ~/utils/arches, behavior in
 * ~/composables/arches; this component is the markup and refs. Decorative
 * only — mounted by the layout on the home route.
 */

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
