import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach, beforeEach, vi } from "vitest";
import {
  clearAppConfig,
  clearAuth,
  clearLocale,
  clearNuxtApp,
  clearNuxtStateRegistry,
  clearRouteGuards,
  clearRouter,
  clearUntheme,
  setRoutePath,
  useHead,
} from "#test/mocks/imports";

beforeEach(() => {
  clearNuxtStateRegistry();
  clearNuxtApp();
  clearAppConfig();
  clearAuth();
  clearLocale();
  clearUntheme();
  setRoutePath("/");
  clearRouter();
  clearRouteGuards();
  useHead.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const info = console.info;
console.info = (...args: unknown[]) => {
  if (String(args[0]).startsWith("<Suspense> is an experimental feature")) {
    return;
  }
  info(...args);
};

enableAutoUnmount(afterEach);
