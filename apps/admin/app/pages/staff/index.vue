<script lang="ts">
import { Dialog, Icon, Table } from "#components";
import { definePageMeta, ref, useHead, useNuxtApp } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import StaffEditor from "~/components/StaffEditor.vue";
import { useTableRequest } from "~/composables/listing";
import { useStaffTable } from "~/composables/staff/table";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["staff:read"] } });

const { $t } = useNuxtApp();
const table = useStaffTable();

useHead(() => ({ title: $t.admin.staff.title() }));

/*
 * A new member is written in a dialog over the list. Its form is drawn
 * only while it is open, so each opening starts blank; once saved, the
 * form itself leads on to the member's page.
 */
const adding = ref(false);

await useTableRequest(table);
</script>

<template>
  <PageHeader
    :title="$t.admin.staff.title()"
    :description="$t.admin.staff.description()"
    :action="$t.admin.staff.new()"
    @action="adding = true"
  />
  <Table :service="table" />
  <Dialog
    v-model:open="adding"
    :title="$t.admin.staff.new()"
    :description="$t.admin.staff.newDescription()"
  >
    <button
      type="button"
      class="staff-new-close"
      :aria-label="$t.admin.editor.cancel()"
      @click="adding = false"
    >
      <Icon name="x" aria-hidden="true" />
    </button>
    <StaffEditor :record="null" />
  </Dialog>
</template>

<style>
/* The way out of the dialog, in its corner, level with its title. */
.staff-new-close {
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

.staff-new-close:hover {
  color: var(--on-surface-high-contrast);
}

.staff-new-close svg {
  display: block;
  width: var(--space-4);
  height: var(--space-4);
}
</style>
