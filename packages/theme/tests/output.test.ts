import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

type Json = Record<string, unknown>;
type Hex = { hex: string };
type Token = { $type: string; $value: unknown };
type Tokens = Record<string, Token>;
type Layer = { id: string; name: string; tokens?: Record<string, Hex> };

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (file: string) => readFileSync(`${root}${file}`, "utf8");
const json = (file: string) => JSON.parse(read(file)) as Json;

const require = createRequire(`${root}package.json`);
const resolve = (specifier: string) =>
  JSON.parse(readFileSync(require.resolve(specifier), "utf8"));

const tokensOf = (document: Json) =>
  Object.fromEntries(
    Object.entries(document).filter(([name]) => !name.startsWith("$")),
  ) as Tokens;

const hexOf = (slot: Token) => (slot.$value as Hex).hex;

const ours = tokensOf(json("src/bbf.json"));

const theirs = tokensOf(resolve("@untheme/aurora/src/themes/aurora.json"));

let config: typeof import("../.output/config.mjs");
let index: typeof import("../.output/index.mjs");
let manifest: typeof import("../.output/manifest.mjs");
let layers: typeof import("../.output/layers.mjs");
let aurora: {
  config: typeof import("@untheme/aurora/config");
  manifest: typeof import("@untheme/aurora/manifest");
  layers: typeof import("@untheme/aurora/layers");
};

beforeAll(async () => {
  execFileSync("pnpm", ["run", "build"], { cwd: root, stdio: "pipe" });
  config = await import("../.output/config.mjs");
  index = await import("../.output/index.mjs");
  manifest = await import("../.output/manifest.mjs");
  layers = await import("../.output/layers.mjs");
  aurora = {
    config: await import("@untheme/aurora/config"),
    manifest: await import("@untheme/aurora/manifest"),
    layers: await import("@untheme/aurora/layers"),
  };
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
      const path = target.includes("*") ? dirname(target) : target;
      expect(existsSync(`${root}${path}`), target).toBe(true);
    }
  });
});

describe("palette", () => {
  it("defines exactly the tokens an aurora theme defines", () => {
    expect(Object.keys(ours)).toEqual(Object.keys(theirs));
    for (const [token, slot] of Object.entries(ours)) {
      expect(slot.$type, token).toBe("color");
      expect(hexOf(slot), token).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("theme", () => {
  it("carries the site's identity", () => {
    expect(config.theme.id).toBe("bbf");
    expect(config.theme.name).toBe("Butte Bible Fellowship");
  });

  it("has exactly aurora's contract", () => {
    const upstream = aurora.config.theme;
    expect([...index.tokens].sort()).toEqual(
      Object.keys(upstream.tokens).sort(),
    );
    for (const [token, slot] of Object.entries(config.theme.tokens)) {
      expect(slot.$type, token).toBe(upstream.tokens[token]?.$type);
    }
  });

  it("binds our palette as authored and everything else as aurora does", () => {
    const upstream = aurora.config.theme.tokens as Tokens;
    for (const [token, slot] of Object.entries(config.theme.tokens)) {
      const own = ours[token];
      if (own) {
        // Terrazzo normalizes colors. Compare the hex only.
        expect((slot.$value as Hex).hex, token).toBe(hexOf(own));
      } else {
        expect(slot.$value, token).toEqual(upstream[token]?.$value);
      }
    }
  });

  it("declares aurora's modifiers, contexts and boot selection, untouched", () => {
    expect(index.modifiers).not.toHaveProperty("theme");
    expect(config.theme.order).toEqual(aurora.config.theme.order);
    expect(config.theme.modifiers).toEqual(aurora.config.theme.modifiers);
    expect(config.input).toEqual(aurora.config.input);
    expect(manifest.manifest).toEqual(aurora.manifest.manifest);
  });
});

describe("layers", () => {
  const layer = (id: string) =>
    json(`.output/layers/${id}.json`) as unknown as Layer;

  it("list our palette first, then every aurora theme in aurora's order", () => {
    const ids = layers.layers.map((entry) => entry.id);
    expect(ids[0]).toBe("bbf");
    expect(ids.slice(1)).toEqual(aurora.layers.layers.map((entry) => entry.id));
    expect(ids.length).toBe(32);
    expect(ids).toContain("nord");
  });

  it("name and describe our palette in its entry", () => {
    const { description, ...entry } = layers.layers[0]!;
    expect(entry).toEqual({ id: "bbf", name: "Butte Bible Fellowship" });
    expect(description).toBeTruthy();
  });

  it("hold, in our palette's layer, the stops that differ from aurora's", () => {
    const bbf = layer("bbf");
    expect(bbf.name).toBe("Butte Bible Fellowship");
    const changed = Object.entries(ours)
      .filter(([token, slot]) => hexOf(slot) !== hexOf(theirs[token]!))
      .map(([token]) => token)
      .sort();
    expect(changed.length).toBeGreaterThan(0);
    expect(Object.keys(bbf.tokens ?? {}).sort()).toEqual(changed);
    for (const [token, value] of Object.entries(bbf.tokens ?? {})) {
      expect(value.hex, token).toBe(hexOf(ours[token]!));
    }
  });

  it("apply every aurora theme, and our palette again", async () => {
    const { makeUntheme } = await import("untheme");
    const untheme = makeUntheme(config.theme, {
      patch: {},
      input: config.input,
    });
    const hex = (token: string) => (untheme.resolve(token as never) as Hex).hex;
    const own = hexOf(ours["primary-600"]!);
    expect(hex("primary-600")).toBe(own);
    for (const entry of layers.layers.slice(1)) {
      const built = layer(entry.id);
      expect(() => untheme.apply(built as never), entry.id).not.toThrow();
      expect(untheme.theme().id, entry.id).toBe(entry.id);
      const upstream = resolve(
        `@untheme/aurora/layers/${entry.id}.json`,
      ) as Layer;
      expect(hex("primary-600"), entry.id).toBe(
        upstream.tokens!["primary-600"]!.hex,
      );
    }
    untheme.apply(layer("bbf") as never);
    expect(untheme.theme().id).toBe("bbf");
    expect(hex("primary-600")).toBe(own);
  });
});

describe("preset", () => {
  it("names the resolver and lists the layers", () => {
    const preset = json(".output/preset.json") as {
      resolver: string;
      layers: unknown[];
    };
    expect(preset.resolver).toBe("./resolver.json");
    expect(preset.layers).toEqual(layers.layers);
  });

  it("references our palette through this package, after aurora's", () => {
    const resolver = json(".output/resolver.json") as {
      name: string;
      description: string;
      sets: { ramps: { sources: { $ref: string }[] } };
      modifiers: Record<string, unknown>;
    };
    expect(resolver.name).toBe("Butte Bible Fellowship");
    expect(resolver.description).toBeTruthy();
    expect(resolver.sets.ramps.sources).toEqual([
      { $ref: "npm:/@untheme/aurora/src/themes/aurora.json" },
      { $ref: "npm:/@bbf/theme/src/bbf.json" },
    ]);
    expect(Object.keys(resolver.modifiers)).toEqual(config.theme.order);
    expect(resolve("@bbf/theme/src/bbf.json")).toEqual(json("src/bbf.json"));
  });
});
