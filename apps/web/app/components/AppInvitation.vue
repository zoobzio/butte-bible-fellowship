<script lang="ts">
import { NuxtLink } from "#components";
import { computed, useAppConfig, useNuxtApp } from "#imports";

import EventWeek from "~/components/EventWeek.vue";
import StaffCard from "~/components/StaffCard.vue";
import { useToday } from "~/composables/events";
import { useRouteLocale } from "~/composables/locale";
import { usePage } from "~/composables/page";
import { week } from "~/utils/events";
</script>

<script setup lang="ts">
defineOptions({ name: "AppInvitation" });

const { invitation } = useAppConfig();
const { $t } = useNuxtApp();
const { path, localize } = useRouteLocale();

// The events page's front matter is the calendar, and the connect page's
// lists the staff: both are read whichever page the bar is under.
const { data: events } = await usePage("/events");
const { data: connect } = await usePage("/connect");

const today = useToday();
const days = computed(() => week(events.value?.events ?? [], today.value));
const staff = computed(() => connect.value?.staff ?? []);

// Under the events page, which is the calendar itself, the bar turns from
// the week to the people: who to ask for, and the way to the connect page.
const meeting = computed(() => path.value === "/events");

const words = computed(() =>
  meeting.value
    ? {
        title: $t.invitation.meet(),
        text: $t.invitation.people(),
        to: "/connect",
        label: $t.invitation.connect(),
      }
    : {
        title: $t.invitation.title(),
        text: invitation.address,
        to: "/events",
        label: $t.invitation.events(),
      },
);
</script>

<template>
  <aside class="site-invitation">
    <div class="site-invitation-body">
      <div class="site-invitation-words">
        <p>
          <strong>{{ words.title }}</strong>
          {{ words.text }}
        </p>
        <NuxtLink :to="localize(words.to)" class="cta">
          {{ words.label }}
        </NuxtLink>
      </div>
      <div v-if="!meeting" class="site-invitation-week">
        <p class="site-invitation-label">{{ $t.invitation.week() }}</p>
        <EventWeek :days="days" />
      </div>
      <div v-else-if="staff.length" class="site-invitation-staff">
        <p class="site-invitation-label">{{ $t.invitation.staff() }}</p>
        <div class="site-invitation-staff-list">
          <StaffCard
            v-for="(member, index) in staff"
            :key="index"
            :member="member"
            compact
          />
        </div>
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
    color-mix(in oklab, var(--primary) 40%, var(--outline-muted));
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
   week, or the people — at the site's width. */
.site-invitation-body {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  align-items: start;
  gap: var(--space-7) clamp(var(--space-7), 6vw, var(--space-9));
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

/* The invitation's words, and under them the way to every event. */
.site-invitation-words {
  display: grid;
  justify-items: start;
  gap: var(--space-5);
}

/* The callout's words, set as it sets them: the invitation in the display
   face, and where to come under it. */
.site-invitation-words p {
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

.site-invitation .cta {
  margin: 0;
}

/* What is listed beside the invitation, said over it like the label over
   a page's contents. */
.site-invitation-label {
  margin: 0 0 var(--space-4);
  font: var(--type-title);
  font-family: var(--font-display);
  font-size: var(--body-size);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--primary-medium-contrast);
}

/* The people, side by side while there is room for them. */
.site-invitation-staff-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 12rem), 1fr));
  gap: var(--space-5) var(--space-6);
}

/* No room for the list beside the invitation: it follows it. */
@media (max-width: 60rem) {
  .site-invitation-body {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
