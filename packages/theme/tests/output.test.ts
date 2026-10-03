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
  JSON.parse(readFileSync(require.resolve(`@untheme/aurora/${file}`), "utf8"));

const resolver = aurora("aurora.resolver.json") as {
  sets: Record<string, { sources: { $ref: string }[] }>;
  modifiers: Record<
    string,
    { contexts: Record<string, unknown>; default: string }
  >;
};

/** Every token aurora's base sets define, by name. */
const upstream = Object.fromEntries(
  Object.values(resolver.sets)
    .flatMap((set) => set.sources.map((source) => source.$ref))
    .flatMap((ref) => Object.entries(aurora(ref.slice(2)) as Tokens)),
) as Tokens;

// Our resolver, and the ramp files of ours its colors set points at.
const AURORA = "npm:/@untheme/aurora/";
const mirror = json("bbf.resolver.json") as unknown as typeof resolver & {
  resolutionOrder: unknown;
};
const local = Object.values(mirror.sets)
  .flatMap((set) => set.sources.map((source) => source.$ref))
  .filter((ref) => !ref.startsWith(AURORA));
const ours = Object.fromEntries(
  local.flatMap((ref) => Object.entries(json(ref) as Tokens)),
) as Tokens;

let config: typeof import("../.output/config.mjs");
let index: typeof import("../.output/index.mjs");

beforeAll(async () => {
  execFileSync("pnpm", ["run", "build"], { cwd: root, stdio: "pipe" });
  config = await import("../.output/config.mjs");
  index = await import("../.output/index.mjs");
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

describe("resolver", () => {
  it("mirrors aurora's sets, modifiers and resolution order", () => {
    const original = aurora("aurora.resolver.json");
    expect(Object.keys(mirror.sets)).toEqual(Object.keys(resolver.sets));
    expect(mirror.resolutionOrder).toEqual(original.resolutionOrder);
    expect(Object.keys(mirror.modifiers)).toEqual(
      Object.keys(resolver.modifiers),
    );
    for (const [name, modifier] of Object.entries(resolver.modifiers)) {
      expect(mirror.modifiers[name]!.default, name).toBe(modifier.default);
      expect(mirror.modifiers[name]!.contexts, name).toEqual(
        Object.fromEntries(
          Object.entries(
            modifier.contexts as Record<string, { $ref: string }[]>,
          ).map(([context, refs]) => [
            context,
            refs.map((ref) => ({ $ref: AURORA + ref.$ref.slice(2) })),
          ]),
        ),
      );
    }
  });

  it("points only the colors set at files of ours", () => {
    for (const [name, set] of Object.entries(resolver.sets)) {
      const sources = mirror.sets[name]!.sources.map((source) => source.$ref);
      expect(sources.length, name).toBe(set.sources.length);
      set.sources.forEach((source, at) => {
        // Each entry is aurora's file, or — in colors — ours of the same path.
        const theirs = AURORA + source.$ref.slice(2);
        if (name === "colors" && sources[at] === source.$ref) {
          return;
        }
        expect(sources[at], name).toBe(theirs);
      });
    }
    expect(local.length).toBeGreaterThan(0);
  });

  it("defines in each ramp of ours exactly the tokens aurora's defines", () => {
    for (const ref of local) {
      const theirs = aurora(ref.slice(2)) as Tokens;
      const mine = json(ref) as Tokens;
      expect(Object.keys(mine), ref).toEqual(Object.keys(theirs));
      for (const [token, slot] of Object.entries(mine)) {
        expect(slot.$type, token).toBe("color");
        expect((slot.$value as { hex: string }).hex, token).toMatch(
          /^#[0-9a-f]{6}$/,
        );
      }
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

  it("binds our ramps as authored and everything else as aurora does", async () => {
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

  it("declares aurora's modifiers, in order, and boots at its defaults", () => {
    expect(config.theme.order).toEqual(Object.keys(resolver.modifiers));
    for (const [name, modifier] of Object.entries(resolver.modifiers)) {
      expect(
        index.modifiers[name as keyof typeof index.modifiers],
        name,
      ).toEqual(Object.keys(modifier.contexts));
    }
    expect(config.input).toEqual(
      Object.fromEntries(
        Object.entries(resolver.modifiers).map(([name, modifier]) => [
          name,
          modifier.default,
        ]),
      ),
    );
  });

  it("accepts every theme in aurora's catalog as a layer", async () => {
    const { makeUntheme } = await import("untheme");
    const { useUnthemeConfig } = await import("untheme/config");
    const untheme = makeUntheme(useUnthemeConfig(config.default));
    const catalog = aurora("themes/index.json") as {
      id: string;
      name: string;
    }[];
    expect(catalog.length).toBeGreaterThan(0);
    for (const { id, name } of catalog) {
      const files = resolver.sets.colors!.sources.map((source) =>
        source.$ref.replace("./tokens/", `themes/${id}/`),
      );
      const tokens = Object.fromEntries(
        files.flatMap((file) =>
          Object.entries(aurora(file) as Tokens).map(([token, source]) => [
            token,
            source.$value,
          ]),
        ),
      );
      expect(() => untheme.create({ id, name, tokens }), id).not.toThrow();
    }
  });
});
