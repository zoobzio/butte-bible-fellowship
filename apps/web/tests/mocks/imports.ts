// Vitest shim for Nuxt's virtual `#imports` module: the part every app of
// the church shares, from the layer, and what the web's own modules put
// there besides.
//
// App code imports framework symbols from "#imports" (Vue APIs, Nuxt
// composables). There is no Nuxt runtime under vitest, so the shared shim
// re-exports the real Vue APIs and stubs the Nuxt-runtime composables.
// Type-only imports are erased by esbuild before this module loads, so only
// value exports matter here.

import type { Root } from "hast";

import { computed, reactive } from "vue";
import { vi } from "vitest";
import { makeProsary } from "prosary";
import { CONTENT_URL } from "@prosary/nuxt/constant";
import { contract, locale } from "@bbf/prose";
import { bundles } from "@bbf/prose/bundles";

export * from "@bbf/nuxt/testing/imports";

// The design system's definition constructors the web's own components
// use, as the @zoobzio/nuxt layer registers them.
export { defineMenu } from "@zoobzio/vue/definitions/menu";

// useNuxtApp: the app, as far as the tests reach into it — `$t`, the real
// resolver over the site's built messages, in the source locale.
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

// useRequestFetch: a fetch of the pages the prosary module serves, from a
// registry filled with setContentPages by each page's path. A page not
// there is a 404, as a document the build does not hold is.
const contentPages = new Map<string, Root>();

export const setContentPages = (pages: Record<string, Root>) => {
  contentPages.clear();
  for (const [path, page] of Object.entries(pages)) {
    contentPages.set(path, page);
  }
};

// Each document asked for, in order, by its locale and file: `es/events.json`.
export const requestedDocuments: string[] = [];

export const clearContentPages = () => {
  contentPages.clear();
  requestedDocuments.length = 0;
};

/** The path of the page a document file is built from. */
const pathOf = (file: string) => {
  const page = file.replace(/^[^/]+\//, "").replace(/\.json$/, "");
  return page === "index" ? "/" : `/${page}`;
};

export const useRequestFetch = () => async (url: string) => {
  const file = url.slice(`${CONTENT_URL}/`.length);
  requestedDocuments.push(file);
  const page = contentPages.get(pathOf(file));
  if (!page) throw Object.assign(new Error(`404 ${url}`), { status: 404 });
  return page;
};
