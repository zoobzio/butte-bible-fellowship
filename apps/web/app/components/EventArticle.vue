<script lang="ts">
import type { PageItem } from "~/types/page";

import type { ChurchEvent } from "@bbf/validators/types";

import { useNuxtApp } from "#imports";

import EventDetails from "~/components/EventDetails.vue";
import MarkdownBody from "~/components/MarkdownBody.vue";
import PageHeader from "~/components/PageHeader.vue";
import { useEventArticle } from "~/composables/events";
</script>

<script setup lang="ts">
defineOptions({ name: "EventArticle" });

// The event, as the calendar lists it, and what is written about it: a page
// of its own, when it has one.
const { event, page } = defineProps<{
  event: ChurchEvent;
  page?: PageItem | null;
}>();

const { $t } = useNuxtApp();
const { description, image } = useEventArticle(
  () => event,
  () => page,
);
</script>

<template>
  <div class="event">
    <PageHeader
      :title="event.title"
      :description="description"
      :back="$t.page.back()"
    />
    <div class="event-body">
      <div class="event-media">
        <img :src="image" alt="" />
      </div>
      <article v-if="page" class="prose">
        <MarkdownBody :page="page" />
      </article>
    </div>
    <aside class="event-aside">
      <EventDetails :event="event" />
    </aside>
  </div>
</template>

<style>
/* The events page's two columns: the event's picture and words where the
   calendar is, and what there is to know of it where the day's events
   are. */
.event {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16rem;
  align-items: start;
  gap: clamp(var(--space-5), 3vw, var(--space-7));
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

/* The header runs the width of both columns. */
.event .page-header {
  grid-column: 1 / -1;
}

.event-body {
  padding-block: var(--space-7) clamp(var(--space-7), 7vw, var(--space-9));
}

/* The picture's frame: the page's own picture, or the church's. */
.event-media {
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-lg);
  background: var(--surface-container);
  box-shadow: var(--elevation-low);
}

.event-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* The grid sets the measure here, so the article fills its column, and the
   picture has already opened the column, so it starts closer under it. */
.event .prose {
  width: auto;
  margin-inline: 0;
  padding-block: var(--space-7) 0;
}

/* Rides down the page with the reader once it meets the header, and
   scrolls on its own when it is taller than the room under it. */
.event-aside {
  position: sticky;
  top: var(--header-height);
  max-height: calc(100dvh - var(--header-height));
  overflow-y: auto;
  padding-block: var(--space-7) clamp(var(--space-7), 7vw, var(--space-9));
}

/* No room for a column beside the article: the card follows it. */
@media (max-width: 60rem) {
  .event {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
  .event-body {
    padding-bottom: 0;
  }
  .event-aside {
    position: static;
    max-height: none;
  }
}
</style>
