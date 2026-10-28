import type { Component } from "vue";

import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, Suspense } from "vue";

export const withSetup = <T>(setup: () => T) => {
  let result!: T;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = setup();
        return () => null;
      },
    }),
  );
  return { result, wrapper };
};

export const mountSuspended = async (component: Component) => {
  let error: unknown;
  const wrapper = mount(
    defineComponent({
      errorCaptured(caught) {
        error = caught;
        return false;
      },
      render: () => h(Suspense, null, { default: () => h(component) }),
    }),
  );
  await flushPromises();
  return { wrapper, error };
};
