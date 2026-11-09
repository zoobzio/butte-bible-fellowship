<script lang="ts">
import { Dialog, Icon, Table } from "#components";
import { definePageMeta, ref, useHead, useNuxtApp } from "#imports";

import EventEditor from "~/components/EventEditor.vue";
import PageHeader from "~/components/PageHeader.vue";
import { useEventsTable } from "~/composables/events/table";
import { useTableRequest } from "~/composables/listing";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["events:read"] } });

const { $t } = useNuxtApp();
const table = useEventsTable();

useHead(() => ({ title: $t.admin.events.title() }));

/*
 * A new event is written in a dialog over the list. Its form is drawn only
 * while it is open, so each opening starts blank; once saved, the form
 * itself leads on to the event's page.
 */
const adding = ref(false);

await useTableRequest(table);
</script>

<template>
  <PageHeader
    :title="$t.admin.events.title()"
    :description="$t.admin.events.description()"
    :action="$t.admin.events.new()"
    @action="adding = true"
  />
  <Table :service="table" />
  <Dialog
    v-model:open="adding"
    :title="$t.admin.events.new()"
    :description="$t.admin.events.newDescription()"
  >
    <button
      type="button"
      class="events-new-close"
      :aria-label="$t.admin.editor.cancel()"
      @click="adding = false"
    >
      <Icon name="x" aria-hidden="true" />
    </button>
    <EventEditor :record="null" />
  </Dialog>
</template>

<style>
/* The way out of the dialog, in its corner, level with its title. */
.events-new-close {
  position: absolute;
  top: var(--space-5);
  right: var(--space-5);
  display: grid;
  place-items: center;
  padding: var(--space-2);
  border: 0;
  border-radius: var(--shape-full);
  background: transparent;
  color: var(--on-surface-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.events-new-close:hover {
  color: var(--on-surface-high-contrast);
}

.events-new-close svg {
  display: block;
  width: var(--space-4);
  height: var(--space-4);
}
</style>
