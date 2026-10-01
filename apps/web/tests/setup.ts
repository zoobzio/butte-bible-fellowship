import { beforeEach } from "vitest";
import {
  clearNuxtCookieRegistry,
  clearNuxtStateRegistry,
} from "#test/mocks/imports";

// Shared useState/useCookie refs (see mocks/imports.ts) must not leak between
// tests.
beforeEach(() => {
  clearNuxtStateRegistry();
  clearNuxtCookieRegistry();
});
