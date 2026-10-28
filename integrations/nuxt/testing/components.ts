// Vitest shim for Nuxt's virtual `#components` module: the part every app of
// the church shares. An app's own `tests/mocks/components.ts` re-exports this
// and adds what its modules put there besides.
//
// Minimal stand-ins for the framework and module components the apps import
// explicitly, and the design system's components the layer's own components
// use, as the @zoobzio/nuxt layer registers them.

import { defineComponent, h } from "vue";

// The design system's components, real: the tests exercise them.
export { default as Command } from "@zoobzio/vue/components/command.vue";
export { default as Popover } from "@zoobzio/vue/components/popover.vue";
export { default as SegmentedControl } from "@zoobzio/vue/components/segmented-control.vue";

// NuxtLink: an anchor to `to`. Class, target and listeners fall through.
export const NuxtLink = defineComponent({
  name: "NuxtLink",
  props: { to: { type: String, default: undefined } },
  setup(props, { slots }) {
    return () => h("a", { href: props.to }, slots.default?.());
  },
});

// Icon: a sprite reference to `name`, like @icon-sheets/nuxt renders.
export const Icon = defineComponent({
  name: "Icon",
  props: { name: { type: String, required: true } },
  setup(props) {
    return () => h("svg", [h("use", { href: `#${props.name}` })]);
  },
});

// Body: renders its children in place.
export const Body = defineComponent({
  name: "Body",
  setup(_, { slots }) {
    return () => slots.default?.();
  },
});
