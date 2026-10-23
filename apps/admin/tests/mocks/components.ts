// Vitest shim for Nuxt's virtual `#components` module: minimal stand-ins for
// the framework and module components the app imports explicitly, and the
// design system's components as the @zoobzio/nuxt layer registers them.

import { defineComponent, h } from "vue";

// The design system's components, real: the tests exercise them.
export { default as Table } from "@zoobzio/vue/components/table.vue";
export { default as Tabs } from "@zoobzio/vue/components/tabs.vue";

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

// Prose: a placeholder for the prosary module's document renderer that
// keeps the tree it was given.
export const Prose = defineComponent({
  name: "Prose",
  props: { tree: { type: Object, required: true } },
  setup() {
    return () => h("div", { class: "prose-document" });
  },
});
