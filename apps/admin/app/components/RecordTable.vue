<script lang="ts">
import type { IconAlias } from "#imports";

import type { RecordLink, TableService } from "~/types/listing";

import { Icon, NuxtLink, Table } from "#components";
import { computed, useNuxtApp } from "#imports";

/**
 * A column's icon, as the app's config sets it. The headless column type
 * does not name the field, so the head's slot reads it here; the layer's
 * wrapper is where that reading belongs once its column type carries it.
 */
const iconOf = <T>(
  column: TableService<T>["columns"][number],
): IconAlias | undefined => (column as { icon?: IconAlias }).icon;
</script>

<script setup lang="ts" generic="T extends object">
defineOptions({ name: "RecordTable" });

const { table, link, title } = defineProps<{
  table: TableService<T>;
  link: RecordLink<T>;
  title: keyof T & string;
}>();

const { $t } = useNuxtApp();

const cell = computed(() => `cell:${title}` as const);

const pt = computed(() => ({
  search: { placeholder: $t.admin.editor.search() },
}));
</script>

<template>
  <div class="record-table">
    <Table :service="table" :pt="pt">
      <template #headerPrepend="{ column }">
        <Icon v-if="iconOf(column)" :name="iconOf(column)!" />
      </template>
      <template #[cell]="{ row }: { row: T }">
        <NuxtLink :to="link(row)" class="record-table-link">
          {{ row[title] }}
        </NuxtLink>
      </template>
      <template #empty>
        <span class="record-table-empty">{{ $t.admin.editor.empty() }}</span>
      </template>
    </Table>
  </div>
</template>

<style>
.record-table-link {
  color: var(--on-surface-high-contrast);
  font-weight: var(--weight-medium);
  text-decoration-color: transparent;
  transition: text-decoration-color var(--transition-fast);
}

.record-table-link:hover {
  color: var(--primary-high-contrast);
  text-decoration-color: currentColor;
}
</style>
