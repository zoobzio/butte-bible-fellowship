<script lang="ts">
import type { StaffRecord } from "@bbf/schema/types";

import { Avatar, FileInput, Icon } from "#components";
import { computed, useId, useNuxtApp } from "#imports";
import { useStaffAvatar } from "~/composables/staff/avatar";
</script>

<script setup lang="ts">
defineOptions({ name: "StaffAvatar" });

const { record } = defineProps<{ record: StaffRecord }>();

const { $t } = useNuxtApp();

const {
  photo,
  fallback,
  accept,
  files,
  uploading,
  removing,
  busy,
  error,
  pick,
  remove,
} = useStaffAvatar(record);

const input = useId();

/* What each badge does, said for a reader and shown under the pointer. */
const picking = computed(() =>
  uploading.value
    ? $t.admin.member.photoUploading()
    : photo.value
      ? $t.admin.member.photoChange()
      : $t.admin.member.photoUpload(),
);
const clearing = computed(() =>
  removing.value
    ? $t.admin.member.photoRemoving()
    : $t.admin.member.photoRemove(),
);

/*
 * The badge is the input's label, and the input itself is out of sight. A
 * picked file is on its way at once, so it is never listed to be removed.
 */
const pt = computed(() => ({
  input: { id: input, "aria-label": picking.value },
  item: () => ({ hidden: true }),
}));
</script>

<template>
  <section class="staff-avatar">
    <div class="staff-avatar-frame" :aria-busy="busy || undefined">
      <Avatar :src="photo ?? ''" alt="" :fallback="fallback" />
      <button
        v-if="photo"
        type="button"
        class="staff-avatar-badge staff-avatar-remove"
        :aria-label="clearing"
        :title="clearing"
        :disabled="busy"
        @click="remove"
      >
        <Icon name="remove" class="staff-avatar-icon" aria-hidden="true" />
      </button>
      <label
        :for="input"
        class="staff-avatar-badge staff-avatar-pick"
        :title="picking"
        :data-disabled="busy || undefined"
      >
        <Icon name="camera" class="staff-avatar-icon" aria-hidden="true" />
      </label>
      <FileInput
        :model-value="files"
        :accept="accept"
        :disabled="busy"
        :pt="pt"
        @update:model-value="pick"
      />
    </div>
    <p v-if="error" class="staff-avatar-error" role="alert">{{ error }}</p>
  </section>
</template>

<style>
.staff-avatar {
  display: grid;
  gap: var(--space-3);
}

.staff-avatar-frame {
  position: relative;
}

/*
 * The picture is a round frame as wide as its panel: the photo fills it,
 * or the initials sit in it.
 */
.staff-avatar .f-avatar-root {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-full);
  background: var(--primary-container);
  color: var(--on-primary-container);
  font: var(--type-display);
  font-family: var(--font-display);
  font-size: calc(var(--display-size) * 1.5);
}

.staff-avatar .f-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* The input stays in reach of the keyboard and of a reader, out of sight. */
.staff-avatar .f-file-input-root {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/*
 * A badge sits on the frame's edge, where the round meets the corner: the
 * upload at the bottom right, the remove across from it.
 */
.staff-avatar-badge {
  position: absolute;
  bottom: calc(14.6% - 1.25rem);
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 1px var(--stroke-solid) transparent;
  border-radius: var(--shape-full);
  box-shadow: var(--elevation-low);
  cursor: pointer;
  transition:
    background var(--transition-base),
    color var(--transition-base),
    box-shadow var(--transition-base);
}

.staff-avatar-icon {
  display: block;
  width: var(--space-5);
  height: var(--space-5);
}

.staff-avatar-pick {
  right: calc(14.6% - 1.25rem);
  background: var(--primary);
  color: var(--on-primary);
}

.staff-avatar-pick:hover:not([data-disabled]) {
  box-shadow: var(--elevation-mid);
}

.staff-avatar-frame:has(.f-file-input-input:focus-visible) .staff-avatar-pick,
.staff-avatar-remove:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.staff-avatar-remove {
  left: calc(14.6% - 1.25rem);
  border-color: var(--rule);
  background: var(--surface);
  color: var(--error);
}

.staff-avatar-remove:hover:not(:disabled) {
  background: var(--error-container);
  color: var(--on-error-container);
}

.staff-avatar-pick[data-disabled],
.staff-avatar-remove:disabled {
  opacity: 0.6;
  cursor: default;
}

.staff-avatar-error {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
  font-size: var(--label-size);
}
</style>
