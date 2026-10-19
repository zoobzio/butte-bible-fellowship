<script setup lang="ts">
defineOptions({ name: "RecordForm" });

// The form an editor's controls stand in: what it is doing, what went wrong,
// and whether there is a record to delete. The controls are slotted in.
const { saving, removing, error, removable } = defineProps<{
  saving: boolean;
  removing: boolean;
  error: string | null;
  removable: boolean;
}>();

const emit = defineEmits<{
  submit: [];
  remove: [];
}>();
</script>

<template>
  <form class="record-form" novalidate @submit.prevent="emit('submit')">
    <div class="record-form-fields">
      <slot />
    </div>

    <p v-if="error" class="record-form-error" role="alert">{{ error }}</p>

    <div class="record-form-actions">
      <button
        type="submit"
        class="record-form-save"
        :disabled="saving || removing"
      >
        {{ saving ? "Saving…" : "Save" }}
      </button>
      <button
        v-if="removable"
        type="button"
        class="record-form-delete"
        :disabled="saving || removing"
        @click="emit('remove')"
      >
        {{ removing ? "Deleting…" : "Delete" }}
      </button>
    </div>
  </form>
</template>

<style>
.record-form {
  display: grid;
  gap: var(--space-6);
  max-width: 44rem;
}

/* The controls, two to a row where there is room, each labelled over its
   input; a wide one — a bio, a body — takes the row. */
.record-form-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--space-4) var(--space-5);
}

.record-form-field {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.record-form-field-wide {
  grid-column: 1 / -1;
}

.record-form-field > label,
.record-form-legend {
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

.record-form-field > input,
.record-form-field > select,
.record-form-field > textarea {
  box-sizing: border-box;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-sm);
  background: var(--surface);
  color: var(--on-surface-high-contrast);
  font: var(--type-body);
  transition: border-color var(--transition-fast);
}

.record-form-field > input:focus-visible,
.record-form-field > select:focus-visible,
.record-form-field > textarea:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
  border-color: var(--primary);
}

.record-form-field > textarea {
  resize: vertical;
  font-family: var(--font-mono, monospace);
  font-size: var(--label-size);
  line-height: 1.6;
}

.record-form-hint {
  font-size: var(--label-size);
  color: var(--on-surface-muted);
}

/* A choice between a few ways, each a radio with its words beside it. */
.record-form-choices {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  border: 0;
}

.record-form-choice {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--on-surface);
}

.record-form-error {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
}

.record-form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.record-form-save,
.record-form-delete {
  padding: var(--space-3) var(--space-5);
  border: 1px var(--stroke-solid) transparent;
  border-radius: var(--shape-full);
  font: var(--type-label);
  font-weight: var(--weight-medium);
  letter-spacing: var(--type-label-letter-spacing);
  cursor: pointer;
  transition:
    background var(--transition-base),
    color var(--transition-base);
}

.record-form-save {
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: var(--elevation-low);
}

.record-form-delete {
  margin-left: auto;
  background: transparent;
  border-color: var(--rule);
  color: var(--error);
}

.record-form-delete:hover:not(:disabled) {
  background: var(--error-container);
  color: var(--on-error-container);
}

.record-form-save:disabled,
.record-form-delete:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
