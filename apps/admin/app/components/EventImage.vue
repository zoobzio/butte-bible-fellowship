<script lang="ts">
import type { EventRecord } from "@bbf/schema/types";

import { FileInput, Icon } from "#components";
import { computed, useId, useNuxtApp } from "#imports";
import { useEventImage } from "~/composables/events/image";
</script>

<script setup lang="ts">
defineOptions({ name: "EventImage" });

const { record } = defineProps<{ record: EventRecord }>();

const { $t } = useNuxtApp();

const {
  picture,
  accept,
  files,
  uploading,
  removing,
  busy,
  error,
  pick,
  remove,
} = useEventImage(record);

const input = useId();

/* What each badge does, said for a reader and shown under the pointer. */
const picking = computed(() =>
  uploading.value
    ? $t.admin.event.imageUploading()
    : picture.value
      ? $t.admin.event.imageChange()
      : $t.admin.event.imageUpload(),
);
const clearing = computed(() =>
  removing.value
    ? $t.admin.event.imageRemoving()
    : $t.admin.event.imageRemove(),
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
  <section class="event-image">
    <div class="event-image-frame" :aria-busy="busy || undefined">
      <img v-if="picture" :src="picture" alt="" class="event-image-picture" />
      <div
        v-else
        class="event-image-none"
        role="img"
        :aria-label="$t.admin.event.imageNone()"
      >
        <Icon name="image" aria-hidden="true" />
      </div>
      <button
        v-if="picture"
        type="button"
        class="event-image-badge event-image-remove"
        :aria-label="clearing"
        :title="clearing"
        :disabled="busy"
        @click="remove"
      >
        <Icon name="remove" class="event-image-icon" aria-hidden="true" />
      </button>
      <label
        :for="input"
        class="event-image-badge event-image-pick"
        :title="picking"
        :data-disabled="busy || undefined"
      >
        <Icon name="camera" class="event-image-icon" aria-hidden="true" />
      </label>
      <FileInput
        :model-value="files"
        :accept="accept"
        :disabled="busy"
        :pt="pt"
        @update:model-value="pick"
      />
    </div>
    <p v-if="error" class="event-image-error" role="alert">{{ error }}</p>
  </section>
</template>

<style>
.event-image {
  display: grid;
  gap: var(--space-3);
}

/*
 * The picture is a frame as wide as its panel, as a card of the site is
 * shaped: the image fills it, or a mark stands in for none.
 */
.event-image-frame {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-md);
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.event-image-picture {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-image-none {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
}

.event-image-none svg {
  display: block;
  width: var(--space-8);
  height: var(--space-8);
  opacity: 0.6;
}

/* The input stays in reach of the keyboard and of a reader, out of sight. */
.event-image .f-file-input-root {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/*
 * A badge sits in a corner of the frame: the upload at the bottom right,
 * the remove across from it.
 */
.event-image-badge {
  position: absolute;
  bottom: var(--space-3);
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

.event-image-icon {
  display: block;
  width: var(--space-5);
  height: var(--space-5);
}

.event-image-pick {
  right: var(--space-3);
  background: var(--primary);
  color: var(--on-primary);
}

.event-image-pick:hover:not([data-disabled]) {
  box-shadow: var(--elevation-mid);
}

.event-image-frame:has(.f-file-input-input:focus-visible) .event-image-pick,
.event-image-remove:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.event-image-remove {
  left: var(--space-3);
  border-color: var(--rule);
  background: var(--surface);
  color: var(--error);
}

.event-image-remove:hover:not(:disabled) {
  background: var(--error-container);
  color: var(--on-error-container);
}

.event-image-pick[data-disabled],
.event-image-remove:disabled {
  opacity: 0.6;
  cursor: default;
}

.event-image-error {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
  font-size: var(--label-size);
}
</style>
