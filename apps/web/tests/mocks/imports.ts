// Vitest shim for Nuxt's virtual `#imports` module.
//
// App code imports framework symbols from "#imports" (Vue APIs, Nuxt
// composables). There is no Nuxt runtime under vitest, so we re-export the real
// Vue APIs and stub the Nuxt-runtime composables. Type-only imports are erased
// by esbuild before this module loads, so only value exports matter here.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { computed, reactive, ref, type Ref } from "vue";
import { vi } from "vitest";
import { makeFibber } from "fibber-lang";
import { makeUntheme } from "untheme";
import { contract, locale } from "@bbf/i18n";
import { bundles } from "@bbf/i18n/bundles";
import theme from "@bbf/theme/config";
import { layers } from "@bbf/theme/layers";

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
// container held like the module holds it: the selection and the patch, with
// the base theme outside it. The service is built once per file, on first
// use, rather than once per test: building it copies and checks the whole
// theme. clearUntheme, run before each test, puts the selection back at boot
// and drops the patch, so each test starts clean.
//
// The module adds `layers` and `select` to the service: the layers of the
// build, and a load of one by id that applies it. Here a layer is read from
// the package's build directly, as the module's catalog imports it. Vitest
// runs from the app root; the happy-dom environment gives modules a non-file
// URL, so the resolution anchors on the working directory.
type Service = ReturnType<typeof makeUntheme<typeof theme.theme>>;
type Layer = Parameters<Service["apply"]>[0];
type Container = Service["config"];

const require = createRequire(resolve(process.cwd(), "package.json"));

let untheme: (Service & { layers: typeof layers; select: unknown }) | undefined;
let container: Container | undefined;

export const useUntheme = () => {
  if (!untheme) {
    container = reactive({ patch: {}, input: { ...theme.input } }) as Container;
    const service = makeUntheme(theme.theme, container);
    const select = async (id: string): Promise<Layer | undefined> => {
      if (!layers.some((entry) => entry.id === id)) {
        return undefined;
      }
      const layer = JSON.parse(
        readFileSync(require.resolve(`@bbf/theme/layers/${id}.json`), "utf8"),
      ) as Layer;
      service.apply(layer);
      return layer;
    };
    untheme = Object.assign(service, { layers, select });
  }
  return untheme;
};

export const clearUntheme = () => {
  if (container) {
    container.input = { ...theme.input };
    container.patch = {};
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
