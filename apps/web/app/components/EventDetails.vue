<script lang="ts">
import type { ChurchEvent } from "#shared/types/events";

import { computed, useAppConfig, useNuxtApp } from "#imports";
import { useEventDays, useEventTime } from "~/composables/events";
import { emailHref, phoneHref } from "~/utils/contact";
</script>

<script setup lang="ts">
defineOptions({ name: "EventDetails" });

const { event } = defineProps<{ event: ChurchEvent }>();

const { contact } = useAppConfig();
const { $t } = useNuxtApp();
const days = useEventDays();
const time = useEventTime();

// When the event is held: its days, then its time — whichever it says.
const when = computed(() =>
  [days(event), time(event)].filter((line) => line !== undefined),
);

// An event that names no place of its own is held at the church.
const where = computed(() => event.location ?? contact.address);
</script>

<template>
  <dl class="event-details">
    <div v-if="when.length" class="event-details-when">
      <dt>{{ $t.events.when() }}</dt>
      <dd v-for="line in when" :key="line">{{ line }}</dd>
    </div>
    <div class="event-details-where">
      <dt>{{ $t.events.where() }}</dt>
      <dd>{{ where }}</dd>
    </div>
    <div class="event-details-questions">
      <dt>{{ $t.events.questions() }}</dt>
      <dd>
        <a :href="phoneHref(contact.phone)">{{ contact.phone }}</a>
      </dd>
      <dd>
        <a :href="emailHref(contact.email)">{{ contact.email }}</a>
      </dd>
    </div>
  </dl>
</template>

<style>
/* The card the events page lists a day's events in, holding what there is
   to know of one: when, where, and who to ask. */
.event-details {
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: var(--space-5) var(--space-5) var(--space-5) var(--space-6);
  border: 1px var(--stroke-solid)
    color-mix(in oklab, var(--primary) 40%, var(--outline-muted));
  border-radius: var(--shape-lg);
  background:
    linear-gradient(
      150deg,
      color-mix(in oklab, var(--secondary-container) 40%, transparent),
      transparent 70%
    ),
    var(--surface-container);
}

.event-details::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(
    108deg,
    var(--primary-500),
    var(--secondary-400) 52%,
    var(--tertiary-400)
  );
}

/* Each answer is ruled off from the one before it, as the events of a day
   are. */
.event-details > div {
  padding: var(--space-4) 0;
  border-top: 1px var(--stroke-solid) var(--outline-muted);
}

.event-details > div:first-child {
  padding-top: 0;
  border-top: 0;
}

.event-details > div:last-child {
  padding-bottom: 0;
}

/* The question, said as the label over a page's contents is. */
.event-details dt {
  margin: 0 0 var(--space-1);
  font: var(--type-title);
  font-family: var(--font-display);
  font-size: var(--label-size);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--primary-medium-contrast);
}

/* An address is one long word: it breaks where the card ends. */
.event-details dd {
  margin: 0;
  line-height: 1.6;
  color: var(--on-surface-high-contrast);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
</style>
