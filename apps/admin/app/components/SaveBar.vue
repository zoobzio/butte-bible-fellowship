<script lang="ts">
import { useNuxtApp } from "#imports";
</script>

<script setup lang="ts">
defineOptions({ name: "SaveBar" });

/*
 * The state of the record as a whole: `dirty` while any of it has a change
 * to save, `open` while any of it has something to put back, `saving`
 * while a save is under way, and what the last save said went wrong.
 */
const {
  dirty,
  open,
  saving,
  errors = [],
} = defineProps<{
  dirty: boolean;
  open: boolean;
  saving: boolean;
  errors?: string[];
}>();

const emit = defineEmits<{ save: []; reset: [] }>();

const { $t } = useNuxtApp();
</script>

<template>
  <div class="save-bar">
    <div class="save-bar-errors">
      <p
        v-for="error in errors"
        :key="error"
        class="save-bar-error"
        role="alert"
      >
        {{ error }}
      </p>
    </div>
    <button
      type="button"
      class="save-bar-reset"
      :disabled="saving || !open"
      @click="emit('reset')"
    >
      {{ $t.admin.editor.reset() }}
    </button>
    <button
      type="button"
      class="save-bar-save"
      :disabled="saving || !dirty"
      @click="emit('save')"
    >
      {{ saving ? $t.admin.editor.saving() : $t.admin.editor.save() }}
    </button>
  </div>
</template>

<style>
/*
 * The bar keeps to the foot of the screen as the record scrolls under it,
 * and rests at the record's own foot once that is reached. What went wrong
 * is said at its start; what can be done sits at its end.
 */
.save-bar {
  position: sticky;
  bottom: 0;
  z-index: 10;
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--action-bar-height);
  padding-block: var(--space-3);
  border-top: 1px var(--stroke-solid) var(--rule);
  background: color-mix(in oklab, var(--surface) 88%, transparent);
  backdrop-filter: blur(var(--blur-sm)) saturate(1.2);
}

.save-bar-errors {
  flex: 1;
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.save-bar-error {
  margin: 0;
  color: var(--error);
  font-size: var(--label-size);
}

.save-bar-save,
.save-bar-reset {
  flex: none;
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

.save-bar-save {
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: var(--elevation-low);
}

.save-bar-reset {
  background: transparent;
  border-color: var(--rule);
  color: var(--on-surface);
}

.save-bar-save:disabled,
.save-bar-reset:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
