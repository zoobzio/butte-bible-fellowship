import { defineComponent, h } from "vue";

export * from "@bbf/nuxt/testing/components";

/** The page under a page: where the parent puts it, with what it is handed. */
export const NuxtPage = defineComponent({
  name: "NuxtPage",
  props: { record: { type: Object, default: undefined } },
  emits: ["saved"],
  setup: () => () => h("div", { class: "nuxt-page" }),
});

export { default as Avatar } from "@zoobzio/vue/components/avatar.vue";
export { default as Editor } from "@zoobzio/vue/components/editor.vue";
export { default as FileInput } from "@zoobzio/vue/components/file-input.vue";
export { default as Form } from "@zoobzio/vue/components/form.vue";
export { default as Table } from "@zoobzio/vue/components/table.vue";
export { default as Tabs } from "@zoobzio/vue/components/tabs.vue";
