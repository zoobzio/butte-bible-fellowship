// Vitest shim for Nuxt's virtual `#imports` module: the part every app of
// the church shares. An app's own `tests/mocks/imports.ts` re-exports this
// and adds what its modules put there besides.
//
// App code imports framework symbols from "#imports" (Vue APIs, Nuxt
// composables). There is no Nuxt runtime under vitest, so this re-exports the
// real Vue APIs and stubs the Nuxt-runtime composables. Type-only imports are
// erased by esbuild before this module loads, so only value exports matter.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { computed, reactive, ref, type Ref } from "vue";
import { vi } from "vitest";
import { makeProsary } from "prosary";
import { makeUntheme } from "untheme";
import { contract, locale } from "@bbf/prose";
import { bundles } from "@bbf/prose/bundles";
import theme from "@bbf/theme/config";
import { layers } from "@bbf/theme/layers";

// Real Vue APIs (ref, computed, watch, onMounted, useTemplateRef, useId, …).
export * from "vue";

// The design system's definition constructors the layer's own components
// use, as the @zoobzio/nuxt layer registers them.
export { defineCommand } from "@zoobzio/vue/definitions/command";
export { defineMenu } from "@zoobzio/vue/definitions/menu";
export { definePopover } from "@zoobzio/vue/definitions/popover";
export { defineSegmentedControl } from "@zoobzio/vue/definitions/segmented-control";

// useNuxtApp: the app, as far as the layer's components reach into it —
// `$t`, the real resolver over the church's built messages, in the source
// locale. An app's shim spreads this into its own, with what its modules
// put on the app besides.
const prosary = makeProsary(
  contract,
  reactive({ locale, messages: await bundles[locale]() }),
);

export const useNuxtApp = () => ({ $t: prosary.createResolver() });

// useLocale: the service's one locale, as the module exposes it. Every
// locale's bundle is loaded up front, so a test switches language in one
// step with setLocale, and the service switches as the module's does.
type Locale = (typeof contract.locales)[number];

const loaded = Object.fromEntries(
  await Promise.all(
    contract.locales.map(async (next) => [next, await bundles[next]()]),
  ),
) as Record<Locale, Awaited<ReturnType<(typeof bundles)[Locale]>>>;

export const setLocale = (next: Locale) => prosary.apply(next, loaded[next]);

export const useLocale = () => ({
  locale: computed(() => prosary.config.locale),
  locales: prosary.locales(),
  setLocale: async (next: Locale) => {
    setLocale(next);
  },
});

export const clearLocale = () => setLocale(locale);

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

// useUntheme: the real service over the church's built theme, in a reactive
// container held like the module holds it: the selection and the patch, with
// the base theme outside it. The service is built once per file, on first
// use, rather than once per test: building it copies and checks the whole
// theme. clearUntheme, run before each test, puts the selection back at boot
// and drops the patch, so each test starts clean.
//
// The module adds `layers` and `select` to the service: the layers of the
// build, and a load of one by id that applies it. Here a layer is read from
// the package's build directly, as the module's catalog imports it. Vitest
// runs from the package root; the happy-dom environment gives modules a
// non-file URL, so the resolution anchors on the working directory.
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

// defineNuxtRouteMiddleware hands the middleware back as it is.
export const defineNuxtRouteMiddleware = <T>(middleware: T) => middleware;

// useAppConfig: tests supply their own config so they don't depend on the
// app's own.
let appConfig: Record<string, unknown> = {};

export const setAppConfig = (config: Record<string, unknown>) => {
  appConfig = config;
};

export const clearAppConfig = () => setAppConfig({});

export const useAppConfig = () => appConfig;

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
