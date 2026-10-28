import { defineComponent, h } from "vue";

export * from "@bbf/nuxt/testing/components";

export const Prose = defineComponent({
  name: "Prose",
  props: { tree: { type: Object, required: true } },
  setup() {
    return () => h("div", { class: "prose-document" });
  },
});
