import { vi } from "vitest";
import { listEntries } from "@untheme/nuxt/server";

import { loadTheme, themes } from "../../server/aurora";
import { CATALOG_BASE } from "~/constants/theme";

/**
 * A minimal stand-in for a `Response`. Under vitest's VM pool a real one
 * parses its body in another realm, and the catalog's plain-object guards
 * reject objects from a foreign realm; this parses in the test's own.
 */
const answer = (status: number, body?: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => JSON.parse(JSON.stringify(body)),
});

/**
 * Stubs the global `fetch` with the theme catalog: requests under the
 * catalog's base are answered from the real server loader, in the wire
 * format the route serves, so the catalog client runs against real data.
 * Returns the stub, to assert on the requests made.
 */
export const stubCatalog = () => {
  const root = `${CATALOG_BASE}/themes`;
  const fetch = vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input), "http://localhost");
    if (url.pathname === root) {
      const listing = JSON.parse(url.searchParams.get("q") ?? "{}");
      return answer(200, listEntries(themes, listing));
    }
    if (url.pathname.startsWith(`${root}/`)) {
      const id = decodeURIComponent(url.pathname.slice(root.length + 1));
      const layer = await loadTheme(id);
      return layer ? answer(200, layer) : answer(404);
    }
    return answer(404);
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
};
