import { beforeEach } from "vitest";
import { clearNuxtStateRegistry } from "#test/mocks/imports";

// Shared useState refs (see mocks/imports.ts) must not leak between tests.
beforeEach(() => {
  clearNuxtStateRegistry();
});
