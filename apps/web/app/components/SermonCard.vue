<script lang="ts">
import type { Sermon } from "#shared/types/sermons";

import { Icon } from "#components";
import { computed, ref, useNuxtApp } from "#imports";

import { useRouteLocale } from "~/composables/locale";

/** The frame's permissions: what YouTube's own embed code asks for. */
const ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
</script>

<script setup lang="ts">
defineOptions({ name: "SermonCard" });

const { sermon } = defineProps<{ sermon: Sermon }>();

const { $t } = useNuxtApp();
const { locale } = useRouteLocale();

// The player is only loaded once the visitor asks for it: until then the
// card is the sermon's thumbnail, and nothing is requested from YouTube's
// player or set in the visitor's browser.
const playing = ref(false);

const src = computed(() => {
  return `https://www.youtube-nocookie.com/embed/${sermon.id}?autoplay=1`;
});

// The date in the church's own time zone, so the server and every visitor's
// browser write the same day.
const published = computed(() => {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "long",
    timeZone: "America/Los_Angeles",
  }).format(new Date(sermon.published));
});
</script>

<template>
  <article class="sermon-card">
    <div class="sermon-card-frame">
      <iframe
        v-if="playing"
        :src="src"
        :title="sermon.title"
        :allow="ALLOW"
        allowfullscreen
      />
      <button
        v-else
        type="button"
        :aria-label="$t.sermons.play({ title: sermon.title })"
        @click="playing = true"
      >
        <img :src="sermon.thumbnail" alt="" loading="lazy" />
        <span class="sermon-card-play">
          <Icon name="play" class="icon" />
        </span>
      </button>
    </div>
    <h2>{{ sermon.title }}</h2>
    <time :datetime="sermon.published">{{ published }}</time>
  </article>
</template>

<style>
.sermon-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.sermon-card-frame {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  margin-bottom: var(--space-2);
  border: 1px var(--stroke-solid) var(--outline-muted);
  border-radius: var(--shape-lg);
  background: var(--surface-container);
  transition:
    border-color var(--transition-base),
    transform var(--transition-base);
}

.sermon-card-frame:has(button:hover) {
  border-color: color-mix(in oklab, var(--primary) 50%, transparent);
  transform: translateY(-2px);
}

.sermon-card-frame iframe,
.sermon-card-frame button,
.sermon-card-frame img {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.sermon-card-frame button {
  padding: 0;
  background: transparent;
  cursor: pointer;
}

/* The feed's thumbnails are 4:3 with the picture letterboxed: covering a
   16:9 frame crops the bars away. */
.sermon-card-frame img {
  object-fit: cover;
}

.sermon-card-play {
  position: absolute;
  inset: 50% auto auto 50%;
  display: grid;
  place-items: center;
  width: var(--space-8);
  aspect-ratio: 1;
  border-radius: 50%;
  background: color-mix(in oklab, var(--surface) 82%, transparent);
  color: var(--primary-medium-contrast);
  transform: translate(-50%, -50%);
  transition: background var(--transition-base);
}

.sermon-card-frame button:hover .sermon-card-play {
  background: var(--surface);
}

.sermon-card h2 {
  display: block;
  margin: 0;
  font: var(--type-title);
  font-family: var(--font-display);
  letter-spacing: var(--type-title-letter-spacing);
}

.sermon-card h2::before {
  content: none;
}

.sermon-card time {
  font: var(--type-label);
  letter-spacing: var(--type-label-letter-spacing);
  color: var(--on-surface-medium-contrast);
}
</style>
