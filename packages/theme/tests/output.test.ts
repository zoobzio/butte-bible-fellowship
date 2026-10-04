import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

type Json = Record<string, unknown>;
type Token = { $type: string; $value: unknown };
type Tokens = Record<string, Token>;

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (file: string) => readFileSync(`${root}${file}`, "utf8");
const json = (file: string) => JSON.parse(read(file)) as Json;

// Aurora's documents, read from the installed package the config points at.
const require = createRequire(`${root}package.json`);
const aurora = (file: string) =>
  JSON.parse(
    readFileSync(require.resolve(`@untheme/aurora/src/${file}`), "utf8"),
  );

const resolver = aurora("resolver.json") as {
  sets: Record<string, { sources: { $ref: string }[] }>;
  modifiers: Record<
    string,
    { contexts: Record<string, { $ref: string }[]>; default: string }
  >;
};

/** The tokens of a document: its entries less the `$`-prefixed metadata. */
const tokensOf = (document: Json) =>
  Object.fromEntries(
    Object.entries(document).filter(([name]) => !name.startsWith("$")),
  ) as Tokens;

/** One aurora theme's ramps, by token name. */
const palette = (id: string) => tokensOf(aurora(`modifiers/theme/${id}.json`));

/** Every token aurora defines: its base sets, and the ramps a theme supplies. */
const upstream = {
  ...palette(resolver.modifiers.theme!.default),
  ...Object.fromEntries(
    Object.values(resolver.sets)
      .flatMap((set) => set.sources.map((source) => source.$ref))
      .flatMap((ref) => Object.entries(tokensOf(aurora(ref.slice(2))))),
  ),
} as Tokens;

// The site's palette: all eight ramps, in one file.
const ours = tokensOf(json("src/bbf.json"));

let config: typeof import("../.output/config.mjs");
let index: typeof import("../.output/index.mjs");
let manifest: typeof import("../.output/manifest.mjs");

beforeAll(async () => {
  execFileSync("pnpm", ["run", "build"], { cwd: root, stdio: "pipe" });
  config = await import("../.output/config.mjs");
  index = await import("../.output/index.mjs");
  manifest = await import("../.output/manifest.mjs");
});

describe("package exports", () => {
  it("point at files the build writes", () => {
    const { exports } = json("package.json") as {
      exports: Record<string, string | Record<string, string>>;
    };
    const targets = Object.values(exports).flatMap((target) =>
      typeof target === "string" ? [target] : Object.values(target),
    );
    expect(targets.length).toBeGreaterThan(0);
    for (const target of targets) {
      expect(existsSync(`${root}${target}`), target).toBe(true);
    }
  });
});

describe("palette", () => {
  it("defines exactly the tokens an aurora theme defines", () => {
    const theirs = palette(resolver.modifiers.theme!.default);
    expect(Object.keys(ours)).toEqual(Object.keys(theirs));
    for (const [token, slot] of Object.entries(ours)) {
      expect(slot.$type, token).toBe("color");
      expect((slot.$value as { hex: string }).hex, token).toMatch(
        /^#[0-9a-f]{6}$/,
      );
    }
  });
});

describe("theme", () => {
  it("carries the site's identity", () => {
    expect(config.theme.id).toBe("bbf");
    expect(config.theme.name).toBe("Butte Bible Fellowship");
  });

  it("defines exactly aurora's tokens", () => {
    expect([...index.tokens].sort()).toEqual(Object.keys(upstream).sort());
  });

  it("binds our palette as authored and everything else as aurora does", async () => {
    // Terrazzo normalizes what it reads — an explicit alpha on a color, a
    // single shadow layer as a list — so compare the custom properties each
    // side renders to rather than the value shapes.
    const { makeUntheme } = await import("untheme");
    const { useUnthemeConfig } = await import("untheme/config");
    const { defineRenderer } = await import("untheme/css");
    const built = defineRenderer(makeUntheme(useUnthemeConfig(config.default)));
    const expected = { ...upstream, ...ours };
    const authored = defineRenderer({
      config: { theme: { tokens: expected } },
      tokens: () =>
        Object.fromEntries(
          Object.entries(expected).map(([token, slot]) => [token, slot.$value]),
        ),
    } as never);
    expect(built.variables()).toEqual(authored.variables());
  });

  it("declares aurora's modifiers, in order, with our theme added and booted", () => {
    expect(config.theme.order).toEqual(Object.keys(resolver.modifiers));
    for (const [name, modifier] of Object.entries(resolver.modifiers)) {
      const contexts = Object.keys(modifier.contexts);
      expect(
        index.modifiers[name as keyof typeof index.modifiers],
        name,
      ).toEqual(name === "theme" ? [...contexts, "bbf"] : contexts);
    }
    expect(config.input).toEqual({
      ...Object.fromEntries(
        Object.entries(resolver.modifiers).map(([name, modifier]) => [
          name,
          modifier.default,
        ]),
      ),
      theme: "bbf",
    });
  });

  it("names and describes our theme in the manifest", () => {
    const theme = manifest.manifest.find((modifier) => modifier.id === "theme");
    const { description, ...entry } = theme!.contexts.find(
      (context) => context.id === "bbf",
    )!;
    expect(entry).toEqual({ id: "bbf", name: "Butte Bible Fellowship" });
    expect(description).toBeTruthy();
  });

  it("switches to every aurora theme and back to ours", async () => {
    const { makeUntheme } = await import("untheme");
    const { useUnthemeConfig } = await import("untheme/config");
    const untheme = makeUntheme(useUnthemeConfig(config.default));
    const hex = (token: string) =>
      (untheme.resolve(token as never) as { hex: string }).hex;
    const own = (ours["primary-600"]!.$value as { hex: string }).hex;
    const themes = Object.keys(resolver.modifiers.theme!.contexts);
    expect(themes.length).toBeGreaterThan(0);
    for (const id of themes) {
      untheme.swap("theme", id as never);
      const theirs = palette(id)["primary-600"]!.$value as { hex: string };
      expect(hex("primary-600"), id).toBe(theirs.hex);
    }
    untheme.swap("theme", "bbf");
    expect(hex("primary-600")).toBe(own);
  });
});
