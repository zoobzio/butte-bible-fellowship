<script lang="ts">
import type { FormFieldPassthrough } from "#imports";

import type { PictureLabels } from "~/types/editor";

import { Icon, ImageInput } from "#components";
import { computed } from "#imports";
</script>

<script setup lang="ts">
defineOptions({ name: "ImageField" });

/*
 * The control of a picture, as a form draws it among its other fields: the
 * image in a frame, with a badge that picks one and a badge that removes
 * it. `control` is what the form wires the field's control with. A picture
 * is a wide frame, with a mark for none; `round`, it is a portrait's
 * circle, and `fallback` is what stands in it for none.
 */
const {
  control,
  labels,
  fallback,
  round = false,
} = defineProps<{
  control: FormFieldPassthrough["imageInput"];
  labels: PictureLabels;
  fallback?: string;
  round?: boolean;
}>();

/*
 * The form's wiring, less the component it would draw: this one draws it.
 * What stands in for no picture is said to a reader, when there is a way
 * to say it.
 */
const settings = computed(() => {
  const { as: _, pt, ...wiring } = control;
  return {
    ...wiring,
    pt: {
      ...pt,
      placeholder: labels.none
        ? { role: "img", "aria-label": labels.none }
        : {},
    },
  };
});
</script>

<template>
  <ImageInput
    v-bind="settings"
    class="image-field"
    :data-round="round || undefined"
  >
    <template #placeholderContent>
      <span v-if="fallback" class="image-field-fallback" aria-hidden="true">
        {{ fallback }}
      </span>
      <Icon v-else name="image" aria-hidden="true" />
    </template>
    <!-- The badge is a label of the input, which is itself out of sight. -->
    <template #pick="{ src, disabled, settings: parts }">
      <label
        class="image-field-badge image-field-pick"
        :for="parts.input.id"
        :title="src ? labels.change : labels.upload"
        :data-disabled="disabled || undefined"
      >
        <Icon name="camera" class="image-field-icon" aria-hidden="true" />
      </label>
    </template>
    <template #remove="{ settings: parts }">
      <button
        class="image-field-badge image-field-remove"
        v-bind="parts.remove"
        :aria-label="labels.remove"
        :title="labels.remove"
      >
        <Icon name="remove" class="image-field-icon" aria-hidden="true" />
      </button>
    </template>
  </ImageInput>
</template>

<style>
/* The frame is all the control takes up: the badges sit on it. */
.image-field {
  position: relative;
  display: block;
}

/*
 * The picture is a frame as wide as its column, as a card of the site is
 * shaped: the image fills it, or a mark stands in for none.
 */
.image-field .f-image-input-preview,
.image-field .f-image-input-placeholder {
  box-sizing: border-box;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-md);
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.image-field .f-image-input-preview {
  display: block;
  object-fit: cover;
}

.image-field .f-image-input-placeholder {
  display: grid;
  place-items: center;
}

.image-field .f-image-input-placeholder svg {
  display: block;
  width: var(--space-8);
  height: var(--space-8);
  opacity: 0.6;
}

/* A portrait is a round frame: the photo fills it, or initials sit in it. */
.image-field[data-round] .f-image-input-preview,
.image-field[data-round] .f-image-input-placeholder {
  aspect-ratio: 1;
  border-radius: var(--shape-full);
}

.image-field-fallback {
  font: var(--type-display);
  font-family: var(--font-display);
  font-size: calc(var(--display-size) * 1.5);
}

/* The input stays in reach of the keyboard and of a reader, out of sight. */
.image-field .f-image-input-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/*
 * A badge sits in a corner of the frame: the pick at the bottom right, the
 * remove across from it.
 */
.image-field-badge {
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

.image-field-icon {
  display: block;
  width: var(--space-5);
  height: var(--space-5);
}

.image-field-pick {
  right: var(--space-3);
  background: var(--primary);
  color: var(--on-primary);
}

.image-field-pick:hover:not([data-disabled]) {
  box-shadow: var(--elevation-mid);
}

.image-field:has(.f-image-input-input:focus-visible) .image-field-pick,
.image-field-remove:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.image-field-remove {
  left: var(--space-3);
  border-color: var(--rule);
  background: var(--surface);
  color: var(--error);
}

.image-field-remove:hover:not(:disabled) {
  background: var(--error-container);
  color: var(--on-error-container);
}

/* On a round frame, a badge sits where the round meets the corner. */
.image-field[data-round] .image-field-badge {
  bottom: calc(14.6% - 1.25rem);
}

.image-field[data-round] .image-field-pick {
  right: calc(14.6% - 1.25rem);
}

.image-field[data-round] .image-field-remove {
  left: calc(14.6% - 1.25rem);
}

.image-field-pick[data-disabled],
.image-field-remove:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
