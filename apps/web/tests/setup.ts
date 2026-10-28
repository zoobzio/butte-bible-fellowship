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

const info = console.info;
console.info = (...args: unknown[]) => {
  if (String(args[0]).startsWith("<Suspense> is an experimental feature")) {
    return;
  }
  info(...args);
};

enableAutoUnmount(afterEach);
