import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

type Json = Record<string, unknown>;
type Source = { id: string; token: Json };
type Scheme = "light" | "dark";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (file: string) => readFileSync(`${root}${file}`, "utf8");
const json = (file: string) => JSON.parse(read(file)) as Json;

/**
 * Flattens a DTCG file into its tokens. A group's `$root` token takes the
 * group's own id, as it does in the build.
 */
const flatten = (node: Json, path: string[] = []): Source[] =>
  Object.entries(node).flatMap(([key, value]) => {
    if (key.startsWith("$") && key !== "$root") return [];
    if (typeof value !== "object" || value === null) return [];
    const next = key === "$root" ? path : [...path, key];
    return "$value" in value
      ? [{ id: next.join("."), token: value as Json }]
      : flatten(value as Json, next);
  });

const refs = (entries: unknown) =>
  (entries as { $ref: string }[]).map((entry) => entry.$ref);

/** `{palette.primary.600}` → `palette.primary.600`; null for a literal. */
const alias = (value: unknown) =>
  typeof value === "string" ? (/^\{(.+)\}$/.exec(value)?.[1] ?? null) : null;

/** The CSS variable a token id is written as. */
const variable = (id: string) => `--${id.replaceAll(".", "-")}`;

// The sources, read the way resolver.json wires them together.
const resolverFile = json("resolver.json") as {
  sets: { base: { sources: unknown } };
  modifiers: { color: { contexts: Record<Scheme, unknown> } };
};
const base = refs(resolverFile.sets.base.sources).flatMap((file) =>
  flatten(json(file)),
);
const roles: Record<Scheme, Source[]> = {
  light: refs(resolverFile.modifiers.color.contexts.light).flatMap((file) =>
    flatten(json(file)),
  ),
  dark: refs(resolverFile.modifiers.color.contexts.dark).flatMap((file) =>
    flatten(json(file)),
  ),
};
const ids = (sources: Source[]) => sources.map((source) => source.id).sort();

/** The declarations of each rule in the built stylesheet, by selector. */
const rules = (css: string) =>
  Object.fromEntries(
    [...css.matchAll(/^([^\s/][^{\n]*?)\s*\{\n([\s\S]*?)\n\}/gm)].map(
      ([, selector, body]) => [
        selector,
        Object.fromEntries(
          [...body!.matchAll(/^\s*(--[\w-]+):\s*(.+);$/gm)].map(
            ([, name, value]) => [name, value],
          ),
        ),
      ],
    ),
  ) as Record<string, Record<string, string>>;

const LIGHT = ":root";
const DARK = ':root[data-color="dark"]';

let css: Record<string, Record<string, string>>;
let tokens: typeof import("../.output/index.js");

beforeAll(async () => {
  execFileSync("pnpm", ["run", "build"], { cwd: root, stdio: "pipe" });
  css = rules(read(".output/index.css"));
  tokens = await import("../.output/index.js");
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

describe("css", () => {
  it("declares the light scheme on :root and the dark scheme on its data-color block", () => {
    expect(Object.keys(css)).toEqual([LIGHT, DARK]);
  });

  it("declares a variable for every token", () => {
    const declared = Object.keys(css[LIGHT]!);
    for (const { id } of [...base, ...roles.light]) {
      expect(declared, id).toContain(variable(id));
    }
  });

  it("re-declares only the color roles for dark, and all of them", () => {
    const expected = ids(roles.dark).map(variable).sort();
    expect(Object.keys(css[DARK]!).sort()).toEqual(expected);
    expect(ids(roles.dark)).toEqual(ids(roles.light));
  });

  it("points each color role at the palette stop it aliases", () => {
    for (const [scheme, selector] of [["light", LIGHT], ["dark", DARK]] as const) {
      for (const { id, token } of roles[scheme]) {
        const target = alias(token.$value);
        expect(target, `${scheme} ${id} aliases the palette`).not.toBeNull();
        expect(css[selector]![variable(id)], `${scheme} ${id}`).toBe(
          `var(${variable(target!)})`,
        );
      }
    }
  });

  it("writes dimensions with their units", () => {
    const dimensions = flatten(json("tokens/layout.json"));
    expect(dimensions.length).toBeGreaterThan(0);
    for (const { id, token } of dimensions) {
      const { value, unit } = token.$value as { value: number; unit: string };
      expect(css[LIGHT]![variable(id)], id).toBe(`${value}${unit}`);
    }
  });

  it("writes gradient.brand as a bare stop list", () => {
    const stops = (
      base.find((source) => source.id === "gradient.brand")!.token
        .$value as { color: string; position: number }[]
    ).map(
      (stop) => `var(${variable(alias(stop.color)!)}) ${stop.position * 100}%`,
    );
    expect(css[LIGHT]!["--gradient-brand"]).toBe(stops.join(", "));
  });
});

describe("js", () => {
  it("lists the light and dark permutations", () => {
    expect(tokens.resolver.listPermutations()).toEqual([
      { color: "light" },
      { color: "dark" },
    ]);
  });

  it("resolves every token in each scheme", () => {
    for (const scheme of ["light", "dark"] as const) {
      const resolved = tokens.resolver.apply({ color: scheme });
      expect(Object.keys(resolved).sort(), scheme).toEqual(
        ids([...base, ...roles[scheme]]),
      );
    }
  });

  it("defaults to the light scheme", () => {
    expect(tokens.resolver.apply({})).toBe(
      tokens.resolver.apply({ color: "light" }),
    );
  });

  it("resolves each color role to the palette stop it aliases", () => {
    for (const scheme of ["light", "dark"] as const) {
      const resolved = tokens.resolver.apply({ color: scheme }) as Record<
        string,
        { $value: { hex: string } }
      >;
      for (const { id, token } of roles[scheme]) {
        const stop = base.find((source) => source.id === alias(token.$value))!;
        expect(resolved[id]!.$value.hex, `${scheme} ${id}`).toBe(
          (stop.token.$value as { hex: string }).hex,
        );
      }
    }
  });

  it("keeps tokens that do not depend on color identical across schemes", () => {
    const light = tokens.resolver.apply({ color: "light" }) as Json;
    const dark = tokens.resolver.apply({ color: "dark" }) as Json;
    const independent = ids(base).filter((id) =>
      /^(palette|space|radius|font|duration|delay|easing)\./.test(id),
    );
    expect(independent.length).toBeGreaterThan(0);
    for (const id of independent) {
      expect(dark[id], id).toEqual(light[id]);
    }
  });
});
