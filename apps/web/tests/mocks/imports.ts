// Vitest shim for Nuxt's virtual `#imports` module.
//
// App code imports framework symbols from "#imports" (Vue APIs, Nuxt
// composables). There is no Nuxt runtime under vitest, so we re-export the real
// Vue APIs and stub the Nuxt-runtime composables. Type-only imports are erased
// by esbuild before this module loads, so only value exports matter here.

import { reactive, ref, type Ref } from "vue";
import { vi } from "vitest";

// Real Vue APIs (ref, computed, watch, onMounted, useTemplateRef, useId, …).
export * from "vue";

// useState dedupes by key — two calls with the same key share one ref. Keep a
// keyed registry, cleared between tests by tests/setup.ts.
const stateRegistry = new Map<string, Ref<unknown>>();

export const clearNuxtStateRegistry = () => stateRegistry.clear();

export const useState = (key: string, init?: () => unknown): Ref<unknown> => {
  const existing = stateRegistry.get(key);
  if (existing) return existing;
  const state = ref(init ? init() : undefined);
  stateRegistry.set(key, state);
  return state;
};

// useCookie: a keyed registry like useState, applying the `default` option.
const cookieRegistry = new Map<string, Ref<unknown>>();

export const clearNuxtCookieRegistry = () => cookieRegistry.clear();

export const useCookie = (
  key: string,
  opts?: { default?: () => unknown },
): Ref<unknown> => {
  const existing = cookieRegistry.get(key);
  if (existing) return existing;
  const cookie = ref(opts?.default ? opts.default() : undefined);
  cookieRegistry.set(key, cookie);
  return cookie;
};

// useAppConfig: tests supply their own config so they don't depend on the
// site's content.
let appConfig: Record<string, unknown> = {};

export const setAppConfig = (config: Record<string, unknown>) => {
  appConfig = config;
};

export const clearAppConfig = () => setAppConfig({});

export const useAppConfig = () => appConfig;

// useRoute: one reactive route, moved with setRoutePath.
const route = reactive({ path: "/" });

export const setRoutePath = (path: string) => {
  route.path = path;
};

export const useRoute = () => route;

// useHead: records what it was given.
export const useHead = vi.fn();

// createError: an Error carrying the status fields.
export const createError = (input: {
  statusCode: number;
  statusMessage: string;
}) => Object.assign(new Error(input.statusMessage), input);

// definePageMeta is compiled away by Nuxt; here it is a no-op.
export const definePageMeta = () => {};

// queryCollection: resolves pages by path from a registry filled with
// setContentPages. A path with no page resolves to null, as in Nuxt Content.
const contentPages = new Map<string, unknown>();

export const setContentPages = (pages: Record<string, unknown>) => {
  contentPages.clear();
  for (const [path, page] of Object.entries(pages)) {
    contentPages.set(path, page);
  }
};

export const clearContentPages = () => contentPages.clear();

export const queryCollection = (_collection: string) => ({
  path: (path: string) => ({
    first: async () => contentPages.get(path) ?? null,
  }),
});

// useAsyncData: awaits the handler and hands back its result as `data`.
export const useAsyncData = async <T>(_key: string, handler: () => Promise<T>) => ({
  data: ref(await handler()),
});
