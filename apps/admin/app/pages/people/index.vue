<script lang="ts">
import { Dialog, Icon, Table, Views } from "#components";
import { definePageMeta, ref, useHead, useNuxtApp } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import PersonEditor from "~/components/PersonEditor.vue";
import { useTableRequest } from "~/composables/listing";
import { usePeopleTable } from "~/composables/people/table";
import { usePeopleTasks } from "~/composables/people/tasks";
import { usePeopleViews } from "~/composables/people/views";
import { useViewsRequest } from "~/composables/views";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["people:read"] } });

const { $t } = useNuxtApp();
const table = usePeopleTable();

/*
 * The saved views sit over the table: its arrangement under a name, the
 * admin's own first and then whoever is signed in's, each a tab.
 */
const views = usePeopleViews(table);

/*
 * What the selection asks for, carried out here: the people selected
 * removed, once asked about, and the table listed afresh.
 */
const { error } = usePeopleTasks(table);

useHead(() => ({ title: $t.admin.people.title() }));

/*
 * A new person is written in a dialog over the list. Its form is drawn
 * only while it is open, so each opening starts blank; once saved, the
 * form itself leads on to the person's page.
 */
const adding = ref(false);

await useViewsRequest(views);
await useTableRequest(table);
</script>

<template>
  <PageHeader
    :title="$t.admin.people.title()"
    :description="$t.admin.people.description()"
    :action="$t.admin.people.new()"
    @action="adding = true"
  />
  <Views :service="views" />
  <p v-if="error" class="people-error" role="alert">{{ error }}</p>
  <Table :service="table" />
  <Dialog
    v-model:open="adding"
    :title="$t.admin.people.new()"
    :description="$t.admin.people.newDescription()"
  >
    <button
      type="button"
      class="people-new-close"
      :aria-label="$t.admin.editor.cancel()"
      @click="adding = false"
    >
      <Icon name="x" aria-hidden="true" />
    </button>
    <PersonEditor :record="null" />
  </Dialog>
</template>

<style>
.people-error {
  margin: 0 0 var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
}

/* The way out of the dialog, in its corner, level with its title. */
.people-new-close {
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

.people-new-close:hover {
  color: var(--on-surface-high-contrast);
}

.people-new-close svg {
  display: block;
  width: var(--space-4);
  height: var(--space-4);
}
</style>
