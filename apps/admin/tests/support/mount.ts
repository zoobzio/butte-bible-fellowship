import type { Component } from "vue";

import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, Suspense } from "vue";

/** Runs a composable inside a mounted component and returns what it gave. */
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

/**
 * Mounts a component with an async setup under Suspense and waits for it.
 * An error thrown from the setup is returned instead of the rendered tree.
 */
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
