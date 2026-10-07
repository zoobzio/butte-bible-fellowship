<script lang="ts">
import type { OutlineEntry } from "~/types/outline";

import { NuxtLink } from "#components";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useNuxtApp,
  useTemplateRef,
  watch,
} from "#imports";

import { useOutlineSpy } from "~/composables/outline";
</script>

<script setup lang="ts">
defineOptions({ name: "TableOfContents" });

const { entries } = defineProps<{ entries: OutlineEntry[] }>();

const { $t } = useNuxtApp();

// The entries whose sections are on screen are marked, and one bar down the
// list's edge runs from the first of them to the last: as the page scrolls,
// it travels the list.
const active = useOutlineSpy(() => entries);

const track$ = useTemplateRef<HTMLElement>("track");
const marker = ref<{ top: number; height: number } | null>(null);
let observer: ResizeObserver | null = null;

const place = () => {
  const items = track$.value?.querySelectorAll<HTMLElement>(
    ".toc-item[data-active]",
  );
  const first = items?.[0];
  const last = items?.[items.length - 1];
  // With nothing on screen the bar keeps its place and fades where it is.
  if (!first || !last) return;
  marker.value = {
    top: first.offsetTop,
    height: last.offsetTop + last.offsetHeight - first.offsetTop,
  };
};

const markerStyle = computed(() =>
  marker.value
    ? {
        height: `${marker.value.height}px`,
        transform: `translateY(${marker.value.top}px)`,
      }
    : undefined,
);

// Placed once the marked entries are in the document, and again whenever
// the list is laid out anew: its entries wrap as the column narrows.
watch(active, place, { flush: "post" });

onMounted(() => {
  place();
  if (!track$.value) return;
  observer = new ResizeObserver(place);
  observer.observe(track$.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <nav v-if="entries.length" class="toc" :aria-label="$t.page.contents()">
    <p class="toc-title">{{ $t.page.contents() }}</p>
    <div ref="track" class="toc-track">
      <span
        class="toc-marker"
        aria-hidden="true"
        :data-active="active.length ? '' : undefined"
        :style="markerStyle"
      />
      <ol class="toc-list">
        <li
          v-for="entry in entries"
          :key="entry.id"
          class="toc-item"
          :data-depth="entry.depth"
          :data-active="active.includes(entry.id) ? '' : undefined"
        >
          <NuxtLink :to="`#${entry.id}`" class="toc-link">
            {{ entry.text }}
          </NuxtLink>
        </li>
      </ol>
    </div>
  </nav>
</template>

<style>
.toc-title {
  margin: 0 0 var(--space-4);
  font: var(--type-title);
  font-family: var(--font-display);
  font-size: var(--label-size);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--primary);
}

/* The list's left edge is a rail, and the marker rides it. */
.toc-track {
  position: relative;
  padding-left: var(--space-4);
}

.toc-track::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 1px;
  background: var(--rule);
}

/* The bar under the header's tabs, stood on end. */
.toc-marker {
  position: absolute;
  inset: 0 auto auto 0;
  width: 2px;
  height: 0;
  background: var(--primary);
  opacity: 0;
  transition:
    transform var(--transition-base),
    height var(--transition-base),
    opacity var(--transition-base);
}

.toc-marker[data-active] {
  opacity: 1;
}

.toc-list {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* The design system rules every list item with a dash: not these. */
.toc-item {
  padding-left: 0;
  font-size: var(--label-size);
  line-height: 1.4;
}

.toc-item::before {
  content: none;
}

.toc-item[data-depth="1"] {
  font-family: var(--font-display);
  font-size: var(--body-size);
  color: var(--on-surface-high-contrast);
}

.toc-item[data-depth="1"]:not(:first-child) {
  margin-top: var(--space-4);
}

.toc-item[data-depth="2"] {
  padding-left: var(--space-3);
}

.toc-item[data-depth="3"] {
  padding-left: var(--space-5);
}

.toc-link {
  color: var(--on-surface-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.toc-item[data-depth="1"] .toc-link {
  color: inherit;
}

.toc-link:hover {
  color: var(--primary-high-contrast);
}

.toc-item[data-active] .toc-link {
  color: var(--primary);
}
</style>
