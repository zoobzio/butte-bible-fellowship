import { reactive, ref } from "vue";
import { vi } from "vitest";
import {
  useAsyncData,
  useNuxtApp as useLayerNuxtApp,
} from "@bbf/nuxt/testing/imports";

export * from "@bbf/nuxt/testing/imports";

export { defineTabs } from "@zoobzio/vue/definitions/tabs";
export { createEditor } from "@zoobzio/nuxt/factories/editor";
export { createForm } from "@zoobzio/nuxt/factories/form";
export { createTable } from "@zoobzio/nuxt/factories/table";

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
  ...useLayerNuxtApp(),
  $log: logger,
  $logger: () => logger,
  callHook,
  hooks: { addHooks },
});

export const clearNuxtApp = () => {
  callHook.mockClear();
  addHooks.mockClear();
};

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

export const useRuntimeConfig = () => ({ public: {} });

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

export const navigateTo = vi.fn(async () => {});

export const useRequestFetch =
  () =>
  (...args: unknown[]) =>
    (
      globalThis as unknown as { $fetch: (...args: unknown[]) => unknown }
    ).$fetch(...args);

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

export const useRequest = useAsyncData;

export const useLazyRequest = useLazyAsyncData;
