<script lang="ts">
import type { RecordLink, TableService } from "~/types/listing";

import { NuxtLink, Table } from "#components";
import { computed, useNuxtApp } from "#imports";
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
</script>

<template>
  <div class="record-table">
    <Table :service="table">
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
.record-table .f-data-table {
  display: grid;
  gap: var(--space-4);
}

.record-table .f-data-table-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.record-table .f-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--body-size);
}

.record-table .f-th,
.record-table .f-td {
  padding: var(--space-3) var(--space-3);
  border-bottom: 1px var(--stroke-solid) var(--rule);
  text-align: left;
  vertical-align: middle;
}

.record-table .f-th {
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
  white-space: nowrap;
}

.record-table .f-tbody .f-tr:hover {
  background: color-mix(in oklab, var(--primary-container) 25%, transparent);
}

.record-table .f-data-table-actions {
  width: 1%;
  text-align: right;
}

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

.record-table-empty {
  color: var(--on-surface-muted);
}

.record-table .f-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-sm);
  background: transparent;
  color: var(--on-surface);
  font: var(--type-label);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast),
    background var(--transition-fast);
}

.record-table .f-button:hover:not(:disabled) {
  color: var(--on-surface-high-contrast);
  border-color: color-mix(in oklab, var(--primary) 65%, transparent);
  background: color-mix(in oklab, var(--primary-container) 30%, transparent);
}

.record-table .f-button:disabled {
  color: var(--on-surface-muted);
  cursor: default;
}

.record-table .f-button[aria-current="page"] {
  background: var(--primary-container);
  border-color: transparent;
  color: var(--on-primary-container);
}

.record-table .f-data-table > .f-group:last-child {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--on-surface-muted);
  font-size: var(--label-size);
}

.record-table .f-data-table > .f-group:last-child .f-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
}

.record-table .f-select-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-sm);
  background: transparent;
  color: var(--on-surface);
  font: var(--type-label);
  cursor: pointer;
}

/* The select menu portals to body. Do not scope it under .record-table. */
.f-select-content {
  min-width: 8rem;
  padding: var(--space-2);
  background: var(--surface-container);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-md);
  box-shadow: var(--elevation-mid);
  z-index: 60;
}

.f-select-item {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--shape-sm);
  color: var(--on-surface);
  font: var(--type-label);
  cursor: pointer;
  outline: none;
}

.f-select-item[data-highlighted] {
  background: color-mix(in oklab, var(--primary-container) 40%, transparent);
  color: var(--on-surface-high-contrast);
}

.f-select-item[data-state="checked"] {
  color: var(--primary);
  font-weight: var(--weight-medium);
}
</style>
