<script lang="ts">
import type { StaffRecord } from "@bbf/schema/types";

import { definePageMeta } from "#imports";

import StaffAvatar from "~/components/StaffAvatar.vue";
import StaffBio from "~/components/StaffBio.vue";
import StaffEditor from "~/components/StaffEditor.vue";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["staff:read"] } });

/*
 * The member, fetched by the page around this one, which names them, and
 * is told when their details are saved, to name them afresh.
 */
const { record } = defineProps<{ record: StaffRecord }>();

const emit = defineEmits<{ saved: [record: StaffRecord] }>();
</script>

<template>
  <div class="staff-page">
    <div class="staff-page-side">
      <StaffAvatar :record="record" />
      <StaffEditor :record="record" @saved="emit('saved', $event)" />
    </div>
    <StaffBio :record="record" />
  </div>
</template>

<style>
/*
 * Two panels: the member's photo over their details in a narrow column,
 * and their bio in what is left. Narrow, one follows the other.
 */
.staff-page {
  display: grid;
  grid-template-columns: minmax(0, 24rem) minmax(0, 1fr);
  align-items: start;
  gap: var(--space-6) var(--space-8);
}

.staff-page-side {
  display: grid;
  gap: var(--space-6);
  min-width: 0;
}

@media (max-width: 60rem) {
  .staff-page {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
