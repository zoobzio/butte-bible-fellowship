import { defineComponent, h } from "vue";

export { default as Command } from "@zoobzio/vue/components/command.vue";
export { default as Menu } from "@zoobzio/vue/components/menu.vue";
export { default as Popover } from "@zoobzio/vue/components/popover.vue";
export { default as SegmentedControl } from "@zoobzio/vue/components/segmented-control.vue";

export const NuxtLink = defineComponent({
  name: "NuxtLink",
  props: { to: { type: String, default: undefined } },
  setup(props, { slots }) {
    return () => h("a", { href: props.to }, slots.default?.());
  },
});

export const Icon = defineComponent({
  name: "Icon",
  props: { name: { type: String, required: true } },
  setup(props) {
    return () => h("svg", [h("use", { href: `#${props.name}` })]);
  },
});

export const Body = defineComponent({
  name: "Body",
  setup(_, { slots }) {
    return () => slots.default?.();
  },
});
