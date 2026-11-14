<script lang="ts">
import type { HomeRecord } from "@bbf/schema/types";

import { FileInput, Icon } from "#components";
import { computed, useId, useNuxtApp } from "#imports";
import { useHomeImage } from "~/composables/settings/image";
</script>

<script setup lang="ts">
defineOptions({ name: "HomeImage" });

/*
 * The picture of the home page's hero, uploaded on its own, as an event's
 * is: the page's settings show it over the form of its metadata.
 */
const { record } = defineProps<{ record: HomeRecord }>();

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
} = useHomeImage(record);

const input = useId();
const title = useId();

/* What each badge does, said for a reader and shown under the pointer. */
const picking = computed(() =>
  uploading.value
    ? $t.admin.home.imageUploading()
    : picture.value
      ? $t.admin.home.imageChange()
      : $t.admin.home.imageUpload(),
);
const clearing = computed(() =>
  removing.value ? $t.admin.home.imageRemoving() : $t.admin.home.imageRemove(),
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
  <section class="home-image" :aria-labelledby="title">
    <h2 :id="title" class="home-image-title">{{ $t.admin.home.image() }}</h2>
    <div class="home-image-frame" :aria-busy="busy || undefined">
      <img v-if="picture" :src="picture" alt="" class="home-image-picture" />
      <div
        v-else
        class="home-image-none"
        role="img"
        :aria-label="$t.admin.home.imageNone()"
      >
        <Icon name="image" aria-hidden="true" />
      </div>
      <button
        v-if="picture"
        type="button"
        class="home-image-badge home-image-remove"
        :aria-label="clearing"
        :title="clearing"
        :disabled="busy"
        @click="remove"
      >
        <Icon name="remove" class="home-image-icon" aria-hidden="true" />
      </button>
      <label
        :for="input"
        class="home-image-badge home-image-pick"
        :title="picking"
        :data-disabled="busy || undefined"
      >
        <Icon name="camera" class="home-image-icon" aria-hidden="true" />
      </label>
      <FileInput
        :model-value="files"
        :accept="accept"
        :disabled="busy"
        :pt="pt"
        @update:model-value="pick"
      />
    </div>
    <p v-if="error" class="home-image-error" role="alert">{{ error }}</p>
  </section>
</template>

<style>
.home-image {
  display: grid;
  gap: var(--space-3);
}

/* The heading reads as the labels of the form under it do. */
.home-image-title {
  display: block;
  margin: 0;
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

.home-image-title::before {
  content: none;
}

/*
 * The picture is a frame as wide as its panel, as an event's is: the
 * image fills it, or a mark stands in for none.
 */
.home-image-frame {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-md);
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.home-image-picture {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-image-none {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
}

.home-image-none svg {
  display: block;
  width: var(--space-8);
  height: var(--space-8);
  opacity: 0.6;
}

/* The input stays in reach of the keyboard and of a reader, out of sight. */
.home-image .f-file-input-root {
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
.home-image-badge {
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

.home-image-icon {
  display: block;
  width: var(--space-5);
  height: var(--space-5);
}

.home-image-pick {
  right: var(--space-3);
  background: var(--primary);
  color: var(--on-primary);
}

.home-image-pick:hover:not([data-disabled]) {
  box-shadow: var(--elevation-mid);
}

.home-image-frame:has(.f-file-input-input:focus-visible) .home-image-pick,
.home-image-remove:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.home-image-remove {
  left: var(--space-3);
  border-color: var(--rule);
  background: var(--surface);
  color: var(--error);
}

.home-image-remove:hover:not(:disabled) {
  background: var(--error-container);
  color: var(--on-error-container);
}

.home-image-pick[data-disabled],
.home-image-remove:disabled {
  opacity: 0.6;
  cursor: default;
}

.home-image-error {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
  font-size: var(--label-size);
}
</style>
