import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";
import { defineRenderer } from "untheme/css";
import config from "@bbf/theme/config";

// The static cascade @untheme/nuxt links into the app, rendered the same way.
const theme = defineRenderer(makeUntheme(useUnthemeConfig(config))).sheet();
// Vitest runs from the app root; the happy-dom environment gives modules a
// non-file URL, so the path anchors on the working directory.
const app = readFileSync(
  resolve(process.cwd(), "app/assets/css/app.css"),
  "utf8",
);

/** The custom properties a stylesheet declares at its root. */
const declared = (css: string) => {
  const root = /^:root \{\n([\s\S]*?)\n\}/m.exec(css)?.[1] ?? "";
  return new Set([...root.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]!));
};

/** The custom properties a stylesheet reads. */
const used = (css: string) =>
  new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]!));

describe("app.css", () => {
  it("reads only variables the theme or its own root declares", () => {
    const tokens = declared(theme);
    expect(tokens.size).toBeGreaterThan(0);
    const own = declared(app);
    // Reka sets its own measurements on the elements it positions.
    const missing = [...used(app)].filter(
      (name) =>
        !tokens.has(name) && !own.has(name) && !name.startsWith("--reka-"),
    );
    expect(missing).toEqual([]);
  });

  it("declares nothing the theme already declares", () => {
    const tokens = declared(theme);
    const shadowed = [...declared(app)].filter((name) => tokens.has(name));
    expect(shadowed).toEqual([]);
  });

  it("keys dark mode off the attribute the module mirrors onto <html>", () => {
    expect(theme).toContain('[data-color="dark"] {');
    expect(app).toContain('[data-color="light"]');
  });
});
