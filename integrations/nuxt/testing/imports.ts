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

export * from "vue";

export { defineCommand } from "@zoobzio/vue/definitions/command";
export { defineMenu } from "@zoobzio/vue/definitions/menu";
export { definePopover } from "@zoobzio/vue/definitions/popover";
export { defineSegmentedControl } from "@zoobzio/vue/definitions/segmented-control";

const prosary = makeProsary(
  contract,
  reactive({ locale, messages: await bundles[locale]() }),
);

export const useNuxtApp = () => ({ $t: prosary.createResolver() });

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

const stateRegistry = new Map<string, Ref<unknown>>();

export const clearNuxtStateRegistry = () => stateRegistry.clear();

export const useState = (key: string, init?: () => unknown): Ref<unknown> => {
  const existing = stateRegistry.get(key);
  if (existing) return existing;
  const state = ref(init ? init() : undefined);
  stateRegistry.set(key, state);
  return state;
};

type Service = ReturnType<typeof makeUntheme<typeof theme.theme>>;
type Layer = Parameters<Service["apply"]>[0];
type Container = Service["config"];

// happy-dom gives modules a non-file URL. Resolve from the working directory.
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

export const defineNuxtRouteMiddleware = <T>(middleware: T) => middleware;

let appConfig: Record<string, unknown> = {};

export const setAppConfig = (config: Record<string, unknown>) => {
  appConfig = config;
};

export const clearAppConfig = () => setAppConfig({});

export const useAppConfig = () => appConfig;

export const useHead = vi.fn();

export const createError = (input: { statusCode: number; message: string }) =>
  Object.assign(new Error(input.message), input);

export const definePageMeta = () => {};

export const useAsyncData = async <T>(
  _key: string,
  handler: () => Promise<T>,
) => ({
  data: ref(await handler()),
});
