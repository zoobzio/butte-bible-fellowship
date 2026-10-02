// Vitest shim for Nuxt's virtual `#components` module: minimal stand-ins for
// the framework and module components the app imports explicitly.

import { defineComponent, h } from "vue";

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

// ContentRenderer: a placeholder that keeps the props it was given.
export const ContentRenderer = defineComponent({
  name: "ContentRenderer",
  props: {
    value: { type: Object, required: true },
    components: { type: Object, default: undefined },
    prose: { type: Boolean, default: true },
  },
  setup() {
    return () => h("div", { class: "content-renderer" });
  },
});
