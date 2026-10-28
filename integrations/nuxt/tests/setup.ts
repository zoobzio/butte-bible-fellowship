import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach, beforeEach } from "vitest";
import {
  clearAppConfig,
  clearLocale,
  clearNuxtStateRegistry,
  clearUntheme,
  useHead,
} from "@bbf/nuxt/testing/imports";

beforeEach(() => {
  clearNuxtStateRegistry();
  clearAppConfig();
  clearLocale();
  clearUntheme();
  useHead.mockClear();
});

enableAutoUnmount(afterEach);
