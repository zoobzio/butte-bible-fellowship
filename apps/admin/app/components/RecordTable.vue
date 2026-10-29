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

const pt = computed(() => ({
  search: { placeholder: $t.admin.editor.search() },
}));
</script>

<template>
  <div class="record-table">
    <Table :service="table" :pt="pt">
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
  align-items: flex-start;
  justify-content: flex-end;
  gap: var(--space-2);
}

/* The search: chips and the input in one field, the panels under it. */
.record-table .f-data-table-search {
  position: relative;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
  max-width: 32rem;
  margin-right: auto;
  padding: var(--space-1) var(--space-2);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-sm);
  background: transparent;
  transition: border-color var(--transition-fast);
}

.record-table .f-data-table-search:focus-within {
  border-color: color-mix(in oklab, var(--primary) 65%, transparent);
}

.record-table .f-data-table-search > .f-group {
  position: relative;
  flex: 1;
  min-width: 8rem;
}

/*
 * The input and the hint over it share one line box: the same height,
 * line height, padding and letter spacing, and no vertical centring, so
 * the hint's glyphs land exactly where the typed ones do.
 */
.record-table .f-autocomplete-input,
.record-table .f-data-table-search > .f-group > .f-group[aria-hidden] {
  box-sizing: border-box;
  width: 100%;
  height: var(--space-6);
  margin: 0;
  padding: 0 var(--space-2);
  border: none;
  font: var(--type-label);
  line-height: var(--space-6);
  letter-spacing: normal;
}

.record-table .f-autocomplete-input {
  display: block;
  background: transparent;
  color: var(--on-surface);
  outline: none;
}

.record-table .f-autocomplete-input::placeholder {
  color: var(--on-surface-muted);
}

.record-table .f-data-table-search > .f-group > .f-group[aria-hidden] {
  position: absolute;
  inset: 0;
  overflow: hidden;
  white-space: pre;
  pointer-events: none;
}

/* The typed part, unseen, holds the completion's place. */
.record-table
  .f-data-table-search
  > .f-group
  > .f-group[aria-hidden]
  .f-span:first-child {
  color: transparent;
}

.record-table
  .f-data-table-search
  > .f-group
  > .f-group[aria-hidden]
  .f-span:last-child {
  color: var(--on-surface-muted);
}

.record-table .f-chip {
  display: inline-flex;
  align-items: center;
  height: var(--space-6);
  padding: 0 var(--space-2);
  border: none;
  border-radius: var(--shape-sm);
  background: var(--primary-container);
  color: var(--on-primary-container);
  font: var(--type-label);
  cursor: pointer;
}

.record-table .f-chip:hover {
  background: color-mix(in oklab, var(--primary-container) 75%, transparent);
}

/*
 * The panels sit side by side, each its own box: the path taken on the
 * left, one chosen item per panel, and the options of the step being
 * typed on the right. The row itself has no box, so a tall panel does not
 * stretch the ones before it. Reka writes `flex-direction: column` inline
 * on the content, hence the override.
 */
.record-table .f-autocomplete-content {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: calc(-1 * var(--space-2));
  flex-direction: row !important;
  align-items: flex-start;
  z-index: 60;
}

.record-table .f-autocomplete-content > .f-group {
  min-width: 10rem;
  padding: var(--space-2);
  background: var(--surface-container);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-md);
  box-shadow: var(--elevation-mid);
}

.record-table .f-autocomplete-content > .f-group + .f-group {
  margin-left: -1px;
}

/* A long panel, the days say, scrolls within itself. */
.record-table .f-autocomplete-content .f-scroll-area-viewport {
  max-height: 16rem;
}

.record-table .f-autocomplete-content .f-scroll-area-scrollbar {
  display: flex;
  width: var(--space-2);
  padding: 1px;
  user-select: none;
  touch-action: none;
}

.record-table .f-autocomplete-content .f-scroll-area-thumb {
  flex: 1;
  border-radius: var(--shape-sm);
  background: var(--on-surface-muted);
}

.record-table .f-autocomplete-content .f-button,
.record-table .f-autocomplete-item {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--shape-sm);
  background: transparent;
  color: var(--on-surface);
  font: var(--type-label);
  text-align: left;
  cursor: pointer;
  outline: none;
}

.record-table .f-autocomplete-content .f-button[aria-current],
.record-table .f-autocomplete-item[data-highlighted] {
  background: color-mix(in oklab, var(--primary-container) 40%, transparent);
  color: var(--on-surface-high-contrast);
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

/*
 * A sortable heading is a button, set as the other headings are; sorted,
 * it reads darker and carries the direction's icon after its label.
 */
.record-table .f-th .f-data-table-header-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-variant-caps: inherit;
  letter-spacing: inherit;
}

.record-table .f-th .f-data-table-header-btn:hover:not(:disabled) {
  border-color: transparent;
  background: transparent;
  color: var(--on-surface-high-contrast);
}

.record-table .f-th.f-data-table-sorted {
  color: var(--on-surface-high-contrast);
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
</style>
