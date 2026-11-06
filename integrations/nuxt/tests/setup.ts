import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach, beforeEach } from "vitest";
import {
  clearAppConfig,
  clearLocale,
  clearNuxtStateRegistry,
  clearUntheme,
  setRoutePath,
  useHead,
} from "@bbf/nuxt/testing/imports";

beforeEach(() => {
  clearNuxtStateRegistry();
  clearAppConfig();
  clearLocale();
  clearUntheme();
  setRoutePath("/");
  useHead.mockClear();
});

enableAutoUnmount(afterEach);
