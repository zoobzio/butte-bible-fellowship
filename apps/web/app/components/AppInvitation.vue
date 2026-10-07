<script lang="ts">
import { computed, useAppConfig, useNuxtApp } from "#imports";

import EventSchedule from "~/components/EventSchedule.vue";
import { usePage } from "~/composables/page";
import { heldOn } from "~/utils/events";
</script>

<script setup lang="ts">
defineOptions({ name: "AppInvitation" });

const { invitation } = useAppConfig();
const { $t } = useNuxtApp();

// The events page's front matter is the calendar: it is read whichever
// page the bar is under.
const { data: events } = await usePage("/events");

// The bar invites the reader to a Sunday: what happens on one is listed
// beside the invitation.
const sunday = computed(() => heldOn(events.value?.events ?? [], "sunday"));
</script>

<template>
  <aside class="site-invitation">
    <div class="site-invitation-body">
      <p class="site-invitation-words">
        <strong>{{ $t.invitation.title() }}</strong>
        {{ invitation.address }}
      </p>
      <div class="site-invitation-schedule">
        <EventSchedule :events="sunday" />
      </div>
    </div>
  </aside>
</template>

<style>
/* A bar the width of the window, filled as the callout cards are — the
   secondary color washed over the container surface — and ruled off from
   the page above as they are bordered. */
.site-invitation {
  padding-block: clamp(var(--space-7), 7vw, var(--space-8));
  border-top: 1px var(--stroke-solid)
    color-mix(in oklab, var(--primary) 40%, var(--rule));
  background:
    linear-gradient(
      150deg,
      color-mix(in oklab, var(--secondary-container) 40%, transparent),
      transparent 70%
    ),
    var(--surface-container);
}

/* The footer is a bar of its own: the two stand one on the other. */
.site-invitation + .site-footer {
  margin-top: 0;
}

/* The invitation, and to its right what it invites the reader to — the
   Sunday — at the site's width. */
.site-invitation-body {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  align-items: start;
  gap: var(--space-7) clamp(var(--space-7), 6vw, var(--space-9));
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

/* The callout's words, set as it sets them: the invitation in the display
   face, and where to come under it. */
.site-invitation-words {
  margin: 0;
  font-size: clamp(
    calc(var(--body-size) * 1.05),
    2vw,
    calc(var(--body-size) * 1.15)
  );
  line-height: 1.8;
  color: var(--on-surface-high-contrast);
  max-width: none;
}

.site-invitation-words strong {
  display: block;
  font: var(--type-headline);
  font-family: var(--font-display);
  font-size: clamp(var(--title-size), 2.6vw, var(--headline-size));
  font-weight: var(--weight-regular);
  margin-bottom: var(--space-2);
  color: var(--on-surface-high-contrast);
}

/* No room for the Sunday beside the invitation: it follows it. */
@media (max-width: 60rem) {
  .site-invitation-body {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
