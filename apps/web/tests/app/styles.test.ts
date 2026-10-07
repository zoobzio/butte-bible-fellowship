import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";
import { defineRenderer } from "untheme/css";
import config from "@bbf/theme/config";

// The static cascade @untheme/nuxt links into the app, rendered the same way.
const theme = defineRenderer(makeUntheme(useUnthemeConfig(config))).sheet();
// Vitest runs from the app root; the happy-dom environment gives modules a
// non-file URL, so the paths anchor on the working directory.
const root = (path: string) => resolve(process.cwd(), path);

/** The files under a directory with an extension, at any depth. */
const files = (directory: string, extension: string) =>
  readdirSync(root(directory), { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(extension))
    .map((file) => readFileSync(root(join(directory, file)), "utf8"));

// The design system's stylesheet, as `@bbf/assets` ships it.
const system = files("node_modules/@bbf/assets/src/css", ".css").join("\n");
// What the app adds: the style blocks of its pages and components.
const blocks = files("app", ".vue")
  .flatMap((file) => [...file.matchAll(/<style[^>]*>\n([\s\S]*?)<\/style>/g)])
  .map((match) => match[1]!)
  .join("\n");
const app = `${system}\n${blocks}`;

/** The custom properties a stylesheet declares at its root, across every
    `:root` block it has: the design system keeps each property beside its
    own commentary, so one sheet may open the root more than once. */
const declared = (css: string) => {
  const roots = [...css.matchAll(/^:root \{\n([\s\S]*?)\n\}/gm)]
    .map((match) => match[1]!)
    .join("\n");
  return new Set([...roots.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]!));
};

/** The custom properties a stylesheet reads. */
const used = (css: string) =>
  new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]!));

describe("styles", () => {
  it("reads only variables the theme or its own root declares", () => {
    const tokens = declared(theme);
    expect(tokens.size).toBeGreaterThan(0);
    const own = declared(system);
    // Reka sets its own measurements on the elements it positions.
    const missing = [...used(app)].filter(
      (name) =>
        !tokens.has(name) && !own.has(name) && !name.startsWith("--reka-"),
    );
    expect(missing).toEqual([]);
  });

  it("declares nothing the theme already declares", () => {
    const tokens = declared(theme);
    const shadowed = [...declared(system)].filter((name) => tokens.has(name));
    expect(shadowed).toEqual([]);
  });

  it("declares custom properties in the design system alone", () => {
    expect(system).not.toBe("");
    expect(blocks).not.toBe("");
    expect(blocks).not.toMatch(/^\s*--[\w-]+:/m);
  });

  it("keys dark mode off the attribute the module mirrors onto <html>", () => {
    expect(theme).toContain('[data-color="dark"] {');
    expect(app).toContain('[data-color="light"]');
  });
});
