<script lang="ts">
import type { SermonRecord } from "@bbf/schema/types";

import { Form } from "#components";
import { useSermonForm } from "~/composables/sermons/form";
</script>

<script setup lang="ts">
defineOptions({ name: "SermonDetails" });

const { record } = defineProps<{ record: SermonRecord }>();

const { form } = useSermonForm(record);

/* The browser's own checks stay off: nothing here is submitted. */
const pt = { form: { novalidate: true } };
</script>

<template>
  <div class="sermon-details">
    <Form :service="form" :pt="pt">
      <!-- An empty slot would draw the form's own buttons in its place. -->
      <template #footer>
        <span hidden />
      </template>
    </Form>
  </div>
</template>

<style>
/* One column of a sermon's details, as narrow as the panel it stands in. */
.sermon-details .f-data-form {
  display: grid;
  gap: var(--space-6);
  max-width: 24rem;
}

/* The page header names the record; the form's own title would repeat it. */
.sermon-details .f-data-form-toolbar {
  display: none;
}

/* The fields stack: a column ignores the spans the form sets. */
.sermon-details .f-data-form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sermon-details .f-data-form-field {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.sermon-details .f-data-form-field-label {
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

/*
 * The fields are read and not written: each keeps the box of an editor's
 * field, on a darker ground, its text as plain to read as any other.
 */
.sermon-details .f-data-form-input,
.sermon-details .f-data-form-textarea,
.sermon-details .f-select-trigger {
  box-sizing: border-box;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-sm);
  background: color-mix(in oklab, var(--surface-container) 60%, transparent);
  color: var(--on-surface-high-contrast);
  font: var(--type-body);
  opacity: 1;
  cursor: default;
}

/* The summary shows whole, and is no one's to resize. */
.sermon-details .f-data-form-textarea {
  display: block;
  resize: none;
}

.sermon-details .f-select-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-align: left;
}

.sermon-details .f-select-trigger > .f-span {
  flex: 1;
  min-height: 1lh;
}

/* A select that does not open has no use for the mark that says it does. */
.sermon-details .f-select-trigger > svg {
  display: none;
}
</style>
