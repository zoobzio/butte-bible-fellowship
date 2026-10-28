import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { makeUntheme } from "untheme";
import { defineRenderer } from "untheme/css";
import config from "@bbf/theme/config";

const theme = defineRenderer(
  makeUntheme(config.theme, { patch: {}, input: config.input }),
).sheet();
// Happy-dom gives modules a non-file URL. Paths use the working directory.
const root = (path: string) => resolve(process.cwd(), path);

const files = (directory: string, extension: string) =>
  readdirSync(root(directory), { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(extension))
    .map((file) => readFileSync(root(join(directory, file)), "utf8"));

const system = files("node_modules/@bbf/assets/src/css", ".css").join("\n");
const blocks = files("app", ".vue")
  .flatMap((file) => [...file.matchAll(/<style[^>]*>\n([\s\S]*?)<\/style>/g)])
  .map((match) => match[1]!)
  .join("\n");
const app = `${system}\n${blocks}`;

const declared = (css: string) => {
  const roots = [...css.matchAll(/^:root \{\n([\s\S]*?)\n\}/gm)]
    .map((match) => match[1]!)
    .join("\n");
  return new Set([...roots.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]!));
};

const used = (css: string) =>
  new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]!));

describe("styles", () => {
  it("reads only variables the theme or its own root declares", () => {
    const tokens = declared(theme);
    expect(tokens.size).toBeGreaterThan(0);
    const own = declared(system);
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
  });
});
