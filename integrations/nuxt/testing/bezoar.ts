// Vitest shim for `#bezoar/service`, the virtual module `@bezoar/nuxt` adds
// to the server build. There is no Nitro under vitest, so the service is a
// stub a test gives queries to; `useBezoar` hands back the same one each call.

import { vi } from "vitest";

export const service = {};

export const useBezoar = vi.fn(() => service);

export const closeBezoar = vi.fn(async () => {});
