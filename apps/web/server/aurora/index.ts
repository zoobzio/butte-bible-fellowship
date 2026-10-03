import type { Entry } from "untheme/catalog";

import manifest from "@untheme/aurora/themes/index.json" with { type: "json" };
import site from "@bbf/theme/config";

import { createThemeHandler, listEntries } from "@untheme/nuxt/server";
import { files } from "./files";

/**
 * A theme as served: identity, and a binding for each token it rebinds.
 */
export interface ThemeLayer {
  id: string;
  name: string;
  tokens: Record<string, unknown>;
}

/**
 * The site's own theme as a layer: its identity and no bindings. A layer
 * resolves against the baseline the app was built with, so one that rebinds
 * nothing is the way back to the site's colors from any other theme.
 */
export const siteTheme: ThemeLayer = {
  id: site.theme.id,
  name: site.theme.name,
  tokens: {},
};

/**
 * One aurora theme as a layer: its `id` and `name` from aurora's manifest,
 * and each token's `$value` from every file of the theme folder as its
 * binding. Plain JSON reads — no Terrazzo at run time. Resolves `undefined`
 * for an id aurora does not ship.
 *
 * @param id - The theme id.
 */
export const loadAuroraTheme = async (
  id: string,
): Promise<ThemeLayer | undefined> => {
  const entry = manifest.find((theme) => theme.id === id);
  const loaders = files[id];
  if (entry === undefined || loaders === undefined) {
    return undefined;
  }

  const tokens: Record<string, unknown> = {};
  const documents = await Promise.all(
    Object.values(loaders).map(async (load) => (await load()).default),
  );
  for (const document of documents) {
    for (const [token, definition] of Object.entries(document)) {
      tokens[token] = definition.$value;
    }
  }
  return { id: entry.id, name: entry.name, tokens };
};

/**
 * One served theme by id: the site's own, or one of aurora's.
 *
 * @param id - The theme id.
 */
export const loadTheme = async (id: string): Promise<ThemeLayer | undefined> =>
  id === siteTheme.id ? siteTheme : loadAuroraTheme(id);

/**
 * The catalog entries: the site's own theme and every aurora theme. A
 * listing orders them itself, by name unless the query says otherwise.
 */
export const themes: Entry[] = [
  { id: siteTheme.id, name: siteTheme.name },
  ...manifest,
];

/**
 * `createThemeHandler` over the site's theme and aurora's theme files: lists
 * them and answers each as a layer. The app is built on aurora's token set,
 * so every aurora layer — a rebind of its ramp tokens — applies. Used by the
 * catch-all route file whose folder is the catalog's base:
 * `server/api/untheme/[...path].get.ts` serves `/api/untheme`.
 */
export const createSiteThemeHandler = () =>
  createThemeHandler({
    list: (listing) => listEntries(themes, listing),
    get: loadTheme,
  });
