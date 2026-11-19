<script lang="ts">
import { Dialog } from "#components";
import { useNuxtApp } from "#imports";
</script>

<script setup lang="ts">
defineOptions({ name: "LeaveDialog" });

/*
 * The window that asks before a page is left with changes not saved: open
 * while there is a move to answer for. Closed any way but by its second
 * button, it stays on the page.
 */
const { open } = defineProps<{ open: boolean }>();

const emit = defineEmits<{ stay: []; leave: [] }>();

const { $t } = useNuxtApp();

const update = (next: boolean) => {
  if (!next) emit("stay");
};
</script>

<template>
  <Dialog
    :open="open"
    :title="$t.admin.editor.leave()"
    :description="$t.admin.editor.leaveDescription()"
    @update:open="update"
  >
    <div class="leave-dialog-actions">
      <button type="button" class="leave-dialog-stay" @click="emit('stay')">
        {{ $t.admin.editor.leaveStay() }}
      </button>
      <button type="button" class="leave-dialog-leave" @click="emit('leave')">
        {{ $t.admin.editor.leaveDiscard() }}
      </button>
    </div>
  </Dialog>
</template>

<style>
/* What can be done, at the window's end: to stay first, to leave last. */
.leave-dialog-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.leave-dialog-stay,
.leave-dialog-leave {
  padding: var(--space-3) var(--space-5);
  border: 1px var(--stroke-solid) transparent;
  border-radius: var(--shape-full);
  font: var(--type-label);
  font-weight: var(--weight-medium);
  letter-spacing: var(--type-label-letter-spacing);
  cursor: pointer;
}

.leave-dialog-stay {
  background: transparent;
  border-color: var(--rule);
  color: var(--on-surface);
}

/* Leaving loses the changes, and is drawn as what cannot be undone. */
.leave-dialog-leave {
  background: var(--error);
  color: var(--on-error);
}

.leave-dialog-stay:focus-visible,
.leave-dialog-leave:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
</style>
