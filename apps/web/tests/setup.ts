import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach, beforeEach } from "vitest";
import {
  clearAppConfig,
  clearContentPages,
  clearLocale,
  clearNuxtStateRegistry,
  clearRouter,
  clearUntheme,
  setRoutePath,
  useHead,
} from "#test/mocks/imports";
// Shared mock state (see mocks/imports.ts) must not leak between tests.
beforeEach(() => {
  clearNuxtStateRegistry();
  clearAppConfig();
  clearContentPages();
  clearLocale();
  clearUntheme();
  setRoutePath("/");
  clearRouter();
  useHead.mockClear();
});

// Async setups need a Suspense boundary, as Nuxt's pages do; Vue's note
// that the API may change is not something a test can act on.
const info = console.info;
console.info = (...args: unknown[]) => {
  if (String(args[0]).startsWith("<Suspense> is an experimental feature")) {
    return;
  }
  info(...args);
};

// Mounted components hold window listeners; unmount them so one test's
// component never reacts to the next test's events.
enableAutoUnmount(afterEach);
