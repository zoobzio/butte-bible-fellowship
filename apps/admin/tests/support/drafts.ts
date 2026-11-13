import type { Component } from "vue";

import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";

import { useDrafts } from "~/composables/drafts";

/**
 * A panel as a record's page draws it: under a page that saves the record
 * as a whole, with that whole to save and reset it by.
 */
export const mountHeld = (panel: Component, record: object | null) => {
  let drafts!: ReturnType<typeof useDrafts>;
  const wrapper = mount(
    defineComponent({
      setup() {
        drafts = useDrafts();
        return () => h(panel, { record });
      },
    }),
    { attachTo: document.body },
  );
  return { wrapper, drafts };
};
