import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach, beforeEach } from "vitest";
import {
  clearAppConfig,
  clearContentPages,
  clearNuxtCookieRegistry,
  clearNuxtStateRegistry,
  setRoutePath,
  useHead,
} from "#test/mocks/imports";

// Shared mock state (see mocks/imports.ts) must not leak between tests.
beforeEach(() => {
  clearNuxtStateRegistry();
  clearNuxtCookieRegistry();
  clearAppConfig();
  clearContentPages();
  setRoutePath("/");
  useHead.mockClear();
});

// Mounted components hold window listeners; unmount them so one test's
// component never reacts to the next test's events.
enableAutoUnmount(afterEach);
