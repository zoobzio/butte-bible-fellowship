import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach, beforeEach } from "vitest";
import {
  clearAppConfig,
  clearLocale,
  clearNuxtStateRegistry,
  clearUntheme,
  useHead,
} from "@bbf/nuxt/testing/imports";

// Shared mock state (see testing/imports.ts) must not leak between tests.
beforeEach(() => {
  clearNuxtStateRegistry();
  clearAppConfig();
  clearLocale();
  clearUntheme();
  useHead.mockClear();
});

// Mounted components hold window listeners; unmount them so one test's
// component never reacts to the next test's events.
enableAutoUnmount(afterEach);
