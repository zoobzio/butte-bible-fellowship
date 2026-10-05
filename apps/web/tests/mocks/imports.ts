// Vitest shim for Nuxt's virtual `#imports` module.
//
// App code imports framework symbols from "#imports" (Vue APIs, Nuxt
// composables). There is no Nuxt runtime under vitest, so we re-export the real
// Vue APIs and stub the Nuxt-runtime composables. Type-only imports are erased
// by esbuild before this module loads, so only value exports matter here.

import { computed, reactive, ref, type Ref } from "vue";
import { vi } from "vitest";
import { makeFibber } from "fibber-lang";
import { makeUntheme } from "untheme";
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
// container held like the module holds it — in useState, so the registry
// reset between tests gives each test a fresh selection.
const services = new WeakMap<object, ReturnType<typeof makeUntheme>>();

export const useUntheme = () => {
  const container = useState("untheme:config", () =>
    reactive(useUnthemeConfig(theme)),
  ).value as object;
  let service = services.get(container);
  if (!service) {
    service = makeUntheme(container as ReturnType<typeof useUnthemeConfig>);
    services.set(container, service);
  }
  return service;
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
