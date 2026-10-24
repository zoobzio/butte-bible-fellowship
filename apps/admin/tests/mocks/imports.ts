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

// The design system's definition constructors and factories, as the
// @zoobzio/nuxt layer registers them.
export { defineTabs } from "@zoobzio/vue/definitions/tabs";
export { createTable } from "@zoobzio/nuxt/factories/table";

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

// useNuxtApp: the app, as far as the design system's widgets reach into it —
// a logger per service, which records nothing, and the hooks a service emits
// its events through, which record what was emitted.
const logger = {
  level: ref("info"),
  backlog: ref([]),
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

export const callHook = vi.fn(async () => {});

export const addHooks = vi.fn(() => () => {});

export const useNuxtApp = () => ({
  $log: logger,
  $logger: () => logger,
  callHook,
  hooks: { addHooks },
});

export const clearNuxtApp = () => {
  callHook.mockClear();
  addHooks.mockClear();
};

// defineNuxtRouteMiddleware hands the middleware back as it is.
export const defineNuxtRouteMiddleware = <T>(middleware: T) => middleware;

// useAuth: the letters-patent service, as far as the app reaches into it —
// who is signed in, which a test sets, and a logout that records the call.
const auth = reactive({
  current: null as { sub: string; name?: string; email?: string } | null,
  logout: vi.fn(async () => {
    auth.current = null;
  }),
});

export const setAuthUser = (user: typeof auth.current) => {
  auth.current = user;
};

export const clearAuth = () => {
  auth.current = null;
  auth.logout.mockClear();
};

export const useAuth = () => auth;

// useAppConfig: tests supply their own config so they don't depend on the
// app's own.
let appConfig: Record<string, unknown> = {};

export const setAppConfig = (config: Record<string, unknown>) => {
  appConfig = config;
};

export const clearAppConfig = () => setAppConfig({});

export const useAppConfig = () => appConfig;

// useRuntimeConfig: the public config the app reads.
export const useRuntimeConfig = () => ({ public: {} });

// useRoute: one reactive route, moved with setRoutePath, its params and
// its query with it.
const route = reactive({
  path: "/",
  params: {} as Record<string, string>,
  query: {} as Record<string, string>,
});

export const setRoutePath = (
  path: string,
  params: Record<string, string> = {},
  query: Record<string, string> = {},
) => {
  route.path = path;
  route.params = params;
  route.query = query;
};

export const useRoute = () => route;

// useRouter: a router that records where it was sent.
const router = {
  back: vi.fn(),
  push: vi.fn(async () => {}),
  replace: vi.fn(async () => {}),
};

export const clearRouter = () => {
  router.back.mockClear();
  router.push.mockClear();
  router.replace.mockClear();
  navigateTo.mockClear();
};

export const useRouter = () => router;

// navigateTo: records where it was sent.
export const navigateTo = vi.fn(async () => {});

// useHead: records what it was given.
export const useHead = vi.fn();

// createError: an Error carrying the status code.
export const createError = (input: { statusCode: number; message: string }) =>
  Object.assign(new Error(input.message), input);

// definePageMeta is compiled away by Nuxt; here it is a no-op.
export const definePageMeta = () => {};

// useAsyncData: awaits the handler and hands back its result as `data`.
export const useAsyncData = async <T>(
  _key: string,
  handler: () => Promise<T>,
) => ({
  data: ref(await handler()),
});

// useLazyAsyncData: hands back the request's state at once, as Nuxt does,
// and fills it as the handler settles — what the design system's widgets
// watch as they initialize.
export const useLazyAsyncData = <T>(
  _key: string,
  handler: () => Promise<T>,
) => {
  const data = ref<T | null>(null);
  const error = ref<unknown>(null);
  const status = ref<"pending" | "success" | "error">("pending");
  const pending = ref(true);
  handler()
    .then(
      (value) => {
        data.value = value;
        status.value = "success";
      },
      (caught: unknown) => {
        error.value = caught;
        status.value = "error";
      },
    )
    .finally(() => {
      pending.value = false;
    });
  return { data, error, status, pending };
};

// useRequest and useLazyRequest: the layer's requests over Nuxt's async
// data, which here are the mocks above. A failure is the handler's own
// rejection; the layer's app error over it is not under test.
export const useRequest = useAsyncData;

export const useLazyRequest = useLazyAsyncData;
