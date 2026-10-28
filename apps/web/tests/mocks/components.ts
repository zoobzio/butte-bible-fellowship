// Vitest shim for Nuxt's virtual `#components` module: the part every app of
// the church shares, from the layer, and what the web's own modules put
// there besides.

import { defineComponent, h } from "vue";

export * from "@bbf/nuxt/testing/components";

// The design system's components the web's own components use, real: the
// tests exercise them.
export { default as Menu } from "@zoobzio/vue/components/menu.vue";

// Prose: a placeholder for the prosary module's document renderer that
// keeps the tree it was given.
export const Prose = defineComponent({
  name: "Prose",
  props: { tree: { type: Object, required: true } },
  setup() {
    return () => h("div", { class: "prose-document" });
  },
});
