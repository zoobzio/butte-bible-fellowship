<script lang="ts">
import { ContentRenderer } from "#components";
import {
  computed,
  createError,
  definePageMeta,
  useAppConfig,
  useHead,
  useNuxtApp,
} from "#imports";

import EventDetails from "~/components/EventDetails.vue";
import PageHeader from "~/components/PageHeader.vue";
import { useEventDays, useEventTime } from "~/composables/events";
import { useRouteLocale } from "~/composables/locale";
import { usePage } from "~/composables/page";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
import { slugOf } from "~/utils/events";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();
const { events: defaults } = useAppConfig();
const { path } = useRouteLocale();

// An event is one of the events page's, found by the slug its address ends
// with: the calendar says when and where it is held.
const { data: calendar } = await usePage("/events");

const slug = path.value.split("/").pop();
const event = computed(() =>
  calendar.value?.events?.find((event) => slugOf(event) === slug),
);

if (!event.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

// What is written about it is a page of its own, at the event's address:
// its picture and its words. An event nothing is written about yet has
// only what the calendar says.
const { data: page } = await usePage(path.value);

useHead(() => ({ title: page.value?.title ?? event.value?.title }));

// The event's picture: its page's, and the church's until the page names
// one.
const image = computed(() => page.value?.image ?? defaults.image);

const days = useEventDays();
const time = useEventTime();

// What the header says under the event's name: the days it is held on, its
// time, and its note — whichever of them it has.
const description = computed(() => {
  if (!event.value) return undefined;
  return [days(event.value), time(event.value), event.value.note]
    .filter(Boolean)
    .join(" · ");
});
</script>

<template>
  <div v-if="event" class="event">
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
        <ContentRenderer
          :value="page"
          :components="MARKDOWN_COMPONENTS"
          :prose="false"
        />
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
