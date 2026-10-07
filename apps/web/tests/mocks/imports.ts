// Vitest shim for Nuxt's virtual `#imports` module.
//
// App code imports framework symbols from "#imports" (Vue APIs, Nuxt
// composables). There is no Nuxt runtime under vitest, so we re-export the real
// Vue APIs and stub the Nuxt-runtime composables. Type-only imports are erased
// by esbuild before this module loads, so only value exports matter here.

import { computed, reactive, ref, toRaw, type Ref } from "vue";
import { vi } from "vitest";
import { makeFibber } from "fibber-lang";
import { copy, makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";
import { contract, locale } from "@bbf/i18n";
import { bundles } from "@bbf/i18n/bundles";
import theme from "@bbf/theme/config";

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

// useUntheme: the real service over the app's built theme, in a reactive
// container held like the module holds it. The service is built once per
// file, on first use, rather than once per test: building it walks the whole
// theme to derive its schema, and through Vue's proxy that walk costs a
// quarter of a second. The schema reads the raw theme instead — no test
// changes the theme — and only the selection and the override, which tests
// do move, are read through the proxy. clearUntheme, run before each test,
// puts the selection back at boot and drops any override, so each test
// starts clean.
let untheme: ReturnType<typeof makeUntheme> | undefined;
let container: ReturnType<typeof useUnthemeConfig> | undefined;

export const useUntheme = () => {
  if (!untheme) {
    container = reactive(useUnthemeConfig(theme)) as typeof container;
    untheme = makeUntheme(container!, { get: { config: { theme: toRaw } } });
  }
  return untheme;
};

export const clearUntheme = () => {
  if (container) {
    container.input = copy(theme.input);
    container.override = {};
  }
};

// useNuxtApp: the app, as far as the tests reach into it — `$t`, the real
// resolver over the site's built messages, in the source locale.
const fibber = makeFibber(
  contract,
  reactive({ locale, messages: await bundles[locale]() }),
);

export const useNuxtApp = () => ({ $t: fibber.createResolver() });

// useLocale: the service's one locale, as the module exposes it.
type Locale = (typeof contract.locales)[number];

const source = fibber.config.messages;

export const useLocale = () => ({
  locale: computed(() => fibber.config.locale),
  locales: fibber.locales(),
  setLocale: async (next: Locale) => {
    fibber.apply(next, await bundles[next]());
  },
});

export const clearLocale = () => fibber.apply(locale, source);

// defineNuxtRouteMiddleware hands the middleware back as it is.
export const defineNuxtRouteMiddleware = <T>(middleware: T) => middleware;

// useAppConfig: tests supply their own config so they don't depend on the
// site's own.
let appConfig: Record<string, unknown> = {};

export const setAppConfig = (config: Record<string, unknown>) => {
  appConfig = config;
};

export const clearAppConfig = () => setAppConfig({});

export const useAppConfig = () => appConfig;

// useRuntimeConfig: the public config the app reads.
export const useRuntimeConfig = () => ({
  public: { youtube: { channel: "UCtest" } },
});

// useRoute: one reactive route, moved with setRoutePath.
const route = reactive({ path: "/" });

export const setRoutePath = (path: string) => {
  route.path = path;
};

export const useRoute = () => route;

// useRouter: a router that records where it was sent. What its history
// holds of the page before this one is set with setRouteBack.
const router = {
  back: vi.fn(),
  push: vi.fn(),
  options: { history: { state: { back: null as string | null } } },
};

export const setRouteBack = (path: string | null) => {
  router.options.history.state.back = path;
};

export const clearRouter = () => {
  router.back.mockClear();
  router.push.mockClear();
  setRouteBack(null);
};

export const useRouter = () => router;

// useHead: records what it was given.
export const useHead = vi.fn();

// createError: an Error carrying the status code.
export const createError = (input: { statusCode: number; message: string }) =>
  Object.assign(new Error(input.message), input);

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

// The collection each query asked, in order.
export const queriedCollections: string[] = [];

export const clearContentPages = () => {
  contentPages.clear();
  queriedCollections.length = 0;
};

export const queryCollection = (collection: string) => {
  queriedCollections.push(collection);
  return {
    path: (path: string) => ({
      first: async () => contentPages.get(path) ?? null,
    }),
  };
};

// useAsyncData: awaits the handler and hands back its result as `data`.
export const useAsyncData = async <T>(
  _key: string,
  handler: () => Promise<T>,
) => ({
  data: ref(await handler()),
});
