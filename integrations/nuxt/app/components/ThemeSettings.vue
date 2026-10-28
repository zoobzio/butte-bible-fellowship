<script lang="ts">
import { Icon, Popover, SegmentedControl } from "#components";
import { definePopover, defineSegmentedControl } from "#imports";
import { useModifiers } from "#layers/bbf/app/composables/modifiers";
</script>

<script setup lang="ts">
defineOptions({ name: "ThemeSettings" });

// The name of the button and of the panel it opens. An app that speaks
// another language names them in that one.
const { label = "Appearance settings" } = defineProps<{ label?: string }>();

const { settings, selection, set } = useModifiers();

const popover = definePopover({ side: "top", align: "start" });

const controls = settings.map(({ id, name, contexts }) => {
  const options = contexts.map((context) => ({
    value: context.id,
    label: context.name,
  }));
  return {
    id,
    name,
    control: defineSegmentedControl(() => ({
      options,
      modelValue: selection.value[id],
      required: true,
      "onUpdate:modelValue": (value) => {
        set(id, value);
      },
    })),
  };
});
</script>

<template>
  <Popover v-bind="popover">
    <template #trigger>
      <button type="button" class="theme-toggle" :aria-label="label">
        <Icon name="sliders" class="icon" />
      </button>
    </template>
    <template #content>
      <div class="theme-settings" role="group" :aria-label="label">
        <div
          v-for="{ id, name, control } in controls"
          :key="id"
          class="theme-settings-setting"
        >
          <span :id="`theme-settings-${id}`" class="f-caption">{{ name }}</span>
          <SegmentedControl
            v-bind="control.value"
            :aria-labelledby="`theme-settings-${id}`"
          />
        </div>
      </div>
    </template>
  </Popover>
</template>

<style>
/* A labelled button group per modifier, in the design system's popover.
   The popover portals to body, so these rules could not be scoped. */
.theme-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 18rem;
  max-width: 100%;
}

.theme-settings-setting {
  display: grid;
  gap: var(--space-1);
}

.theme-settings-setting .f-caption {
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}
</style>
