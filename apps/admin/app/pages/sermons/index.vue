<script lang="ts">
import { Icon, NuxtLink, Timeline, Views } from "#components";
import { definePageMeta, useHead, useNuxtApp } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import { useSermonDay } from "~/composables/sermons/day";
import { useSermonTasks } from "~/composables/sermons/tasks";
import { useSermonsTimeline } from "~/composables/sermons/timeline";
import { useSermonViews } from "~/composables/sermons/views";
import { useTimelineRequest } from "~/composables/timeline";
import { useViewsRequest } from "~/composables/views";
import { link, thumbnail, watch } from "~/constants/sermons";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["sermons:read"] } });

const { $t } = useNuxtApp();
const preached = useSermonDay();
const timeline = useSermonsTimeline();

/*
 * The saved views sit over the timeline: its search under a name, the
 * admin's own first and then whoever is signed in's, each a tab.
 */
const views = useSermonViews(timeline);

/*
 * What the page carries out on the sermons: a sync with the church's
 * YouTube channel, from the header.
 */
const { syncing, notice, error, sync } = useSermonTasks(timeline);

useHead(() => ({ title: $t.admin.sermons.title() }));

await useViewsRequest(views);
await useTimelineRequest(timeline);
</script>

<template>
  <PageHeader
    :title="$t.admin.sermons.title()"
    :description="$t.admin.sermons.description()"
    :action="syncing ? $t.admin.sermons.syncing() : $t.admin.sermons.sync()"
    @action="sync"
  />
  <p v-if="error" class="sermons-error" role="alert">{{ error }}</p>
  <p v-else-if="notice" class="sermons-notice" role="status">{{ notice }}</p>
  <Views :service="views" />
  <Timeline :service="timeline">
    <!--
      A sermon's row, drawn here whole so that its title is the way to its
      page: its picture, its title over who preached it and when, and at
      its end whether it is on the site and its recording.
    -->
    <template #record="{ item }">
      <article class="f-article f-data-timeline-record" :data-key="item.key">
        <!--
          The picture is a frame of the recording, which names nothing the
          title beside it does not. A sermon with none keeps the frame's
          place, so the titles stay in line.
        -->
        <span class="sermons-thumbnail">
          <img
            v-if="thumbnail(item.record)"
            :src="thumbnail(item.record)"
            alt=""
            width="320"
            height="180"
            loading="lazy"
            decoding="async"
          />
          <Icon v-else name="play" aria-hidden="true" />
        </span>
        <NuxtLink
          :to="link(item.record)"
          class="f-anchor f-data-timeline-record-label"
        >
          {{ item.record.title }}
        </NuxtLink>
        <!-- A sermon is of a day and no time of it: the day it was preached. -->
        <p class="f-p f-data-timeline-record-time sermons-meta">
          <span v-if="item.record.speaker" class="sermons-speaker">
            {{ item.record.speaker }}
          </span>
          <time class="f-time" :datetime="item.record.date">
            {{ preached(item.record.date) }}
          </time>
        </p>
        <div class="sermons-actions">
          <span class="sermons-status" :data-status="item.record.status">
            {{ $t.admin.sermons[item.record.status]() }}
          </span>
          <a
            v-if="item.record.video"
            :href="watch(item.record.video)"
            class="f-anchor sermons-watch"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="$t.admin.sermons.watch({ title: item.record.title })"
          >
            <Icon name="play" aria-hidden="true" />
          </a>
        </div>
      </article>
    </template>
  </Timeline>
</template>

<style>
.sermons-error,
.sermons-notice {
  margin: 0 0 var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--shape-sm);
}

.sermons-error {
  background: var(--error-container);
  color: var(--on-error-container);
}

.sermons-notice {
  background: var(--surface-container);
  color: var(--on-surface);
}

/*
 * A sermon's picture, before its title: a frame the shape of a recording,
 * cut to it whatever the picture's own shape, and one with no picture an
 * empty frame of the same size.
 */
.sermons-thumbnail {
  display: grid;
  grid-area: prepend;
  place-items: center;
  width: calc(2 * var(--space-9));
  aspect-ratio: 16 / 9;
  margin-right: var(--space-4);
  overflow: hidden;
  border-radius: var(--shape-sm);
  background: var(--surface-container);
  color: var(--on-surface-muted);
}

.sermons-thumbnail img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Who preached it, then the day, a dot between the two. */
.sermons-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: var(--space-2);
}

.sermons-speaker {
  color: var(--on-surface);
}

.sermons-speaker::after {
  margin-left: var(--space-2);
  color: var(--on-surface-muted);
  content: "·";
}

/* What a sermon's row ends in, in a line, clear of its title. */
.sermons-actions {
  display: flex;
  grid-area: append;
  align-items: center;
  gap: var(--space-2);
  margin-left: var(--space-4);
}

/* Whether a sermon is on the site, as a small label. */
.sermons-status {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--shape-full);
  background: var(--surface-container);
  color: var(--on-surface-muted);
  font: var(--type-label);
  letter-spacing: var(--type-label-letter-spacing);
}

.sermons-status[data-status="published"] {
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.sermons-watch {
  display: grid;
  place-items: center;
  padding: var(--space-2);
  border-radius: var(--shape-full);
  color: var(--on-surface-muted);
  transition: color var(--transition-fast);
}

.sermons-watch:hover {
  color: var(--primary);
}

/* Under its title on a narrow page, in line with it and not the picture. */
@media (max-width: 44rem) {
  .sermons-actions {
    margin: var(--space-3) 0 0;
  }
}
</style>
