<script lang="ts">
import { Dialog, Icon, Table } from "#components";
import { definePageMeta, ref, useHead, useNuxtApp } from "#imports";

import ContentEditor from "~/components/ContentEditor.vue";
import PageHeader from "~/components/PageHeader.vue";
import { useContentTable } from "~/composables/content/table";
import { useTableRequest } from "~/composables/listing";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["content:read"] } });

const { $t } = useNuxtApp();
const table = useContentTable();

useHead(() => ({ title: $t.admin.content.title() }));

/*
 * A new page is written in a dialog over the list. Its form is drawn only
 * while it is open, so each opening starts blank; once saved, the form
 * itself leads on to the page's own page.
 */
const adding = ref(false);

await useTableRequest(table);
</script>

<template>
  <PageHeader
    :title="$t.admin.content.title()"
    :description="$t.admin.content.description()"
    :action="$t.admin.content.new()"
    @action="adding = true"
  />
  <Table :service="table" />
  <Dialog
    v-model:open="adding"
    :title="$t.admin.content.new()"
    :description="$t.admin.content.newDescription()"
  >
    <button
      type="button"
      class="content-new-close"
      :aria-label="$t.admin.editor.cancel()"
      @click="adding = false"
    >
      <Icon name="x" aria-hidden="true" />
    </button>
    <ContentEditor :record="null" />
  </Dialog>
</template>

<style>
/* The way out of the dialog, in its corner, level with its title. */
.content-new-close {
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

.content-new-close:hover {
  color: var(--on-surface-high-contrast);
}

.content-new-close svg {
  display: block;
  width: var(--space-4);
  height: var(--space-4);
}
</style>
