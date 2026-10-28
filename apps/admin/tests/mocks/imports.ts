// Vitest shim for Nuxt's virtual `#imports` module: the part every app of
// the church shares, from the layer, and what the admin's own modules put
// there besides.
//
// App code imports framework symbols from "#imports" (Vue APIs, Nuxt
// composables). There is no Nuxt runtime under vitest, so the shared shim
// re-exports the real Vue APIs and stubs the Nuxt-runtime composables.
// Type-only imports are erased by esbuild before this module loads, so only
// value exports matter here.

import { reactive, ref } from "vue";
import { vi } from "vitest";
import { useAsyncData } from "@bbf/nuxt/testing/imports";

export * from "@bbf/nuxt/testing/imports";

// The design system's definition constructors and factories the admin's own
// components use, as the @zoobzio/nuxt layer registers them.
export { defineTabs } from "@zoobzio/vue/definitions/tabs";
export { createTable } from "@zoobzio/nuxt/factories/table";

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

// useRequestFetch: in the browser, Nuxt's is `$fetch` itself; here it is
// whatever a test has stubbed `$fetch` with, read as each request is made.
export const useRequestFetch =
  () =>
  (...args: unknown[]) =>
    (
      globalThis as unknown as { $fetch: (...args: unknown[]) => unknown }
    ).$fetch(...args);

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
