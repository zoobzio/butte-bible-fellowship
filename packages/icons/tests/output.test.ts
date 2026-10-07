import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

import config from "../icon-sheets.config";

type IconifyCollection = {
  width?: number;
  height?: number;
  icons: Record<string, { body: string; width?: number; height?: number }>;
};
type Symbol = { id: string; viewBox: string; body: string };

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (file: string) => readFileSync(`${root}${file}`, "utf8");

const expectedAliases = Object.keys(config.icons).sort();

/** A `./file.svg` ref names a local SVG rather than an Iconify icon. */
const isLocal = (alias: string) => config.icons[alias]!.startsWith("./");
const iconifyAliases = expectedAliases.filter((alias) => !isLocal(alias));
const localAliases = expectedAliases.filter(isLocal);

/** The local SVG behind an alias: its geometry and the paths it draws. */
const local = (alias: string) => {
  const svg = read(config.icons[alias]!.slice(2));
  const [, viewBox] = /viewBox="([^"]+)"/.exec(svg)!;
  const paths = [...svg.matchAll(/<path d="[^"]*"\/>/g)].map(([m]) => m);
  return { viewBox: viewBox!, paths };
};

/** What each alias should resolve to, read from its Iconify collection. */
const source = (alias: string) => {
  const [collection, name] = config.icons[alias]!.split(":") as [
    string,
    string,
  ];
  const data = JSON.parse(
    read(`node_modules/@iconify-json/${collection}/icons.json`),
  ) as IconifyCollection;
  const icon = data.icons[name]!;
  return {
    body: icon.body,
    width: icon.width ?? data.width ?? 16,
    height: icon.height ?? data.height ?? 16,
  };
};

const symbols = (svg: string): Symbol[] =>
  [
    ...svg.matchAll(/<symbol id="([^"]+)" viewBox="([^"]+)">(.*?)<\/symbol>/gs),
  ].map(([, id, viewBox, body]) => ({
    id: id!,
    viewBox: viewBox!,
    body: body!,
  }));

const expectedSymbols: Symbol[] = iconifyAliases.map((alias) => {
  const { body, width, height } = source(alias);
  return { id: alias, viewBox: `0 0 ${width} ${height}`, body };
});

/** A local symbol keeps the file's viewBox, its paths and `currentColor`. */
const expectLocalSymbol = (symbol: Symbol | undefined, alias: string) => {
  const { viewBox, paths } = local(alias);
  expect(symbol, alias).toBeDefined();
  expect(symbol!.viewBox).toBe(viewBox);
  expect(symbol!.body).toContain('fill="currentColor"');
  for (const path of paths) expect(symbol!.body).toContain(path);
};

const byId = (list: Symbol[]) =>
  Object.fromEntries(list.map((symbol) => [symbol.id, symbol]));

let index: typeof import("../.output/index.mjs");
let contract: typeof import("../.output/config.mjs");
let sets: typeof import("../.output/sets.mjs");
let sheet: typeof import("../.output/sheet.mjs");

beforeAll(async () => {
  execFileSync("pnpm", ["run", "build"], { cwd: root, stdio: "pipe" });
  index = await import("../.output/index.mjs");
  contract = await import("../.output/config.mjs");
  sets = await import("../.output/sets.mjs");
  sheet = await import("../.output/sheet.mjs");
});

describe("package exports", () => {
  it("point at files the build writes", () => {
    const { exports } = JSON.parse(read("package.json")) as {
      exports: {
        ".": Record<string, string>;
        "./*": Record<string, string>;
        "./*.svg": string;
      };
    };
    const targets = [
      ...Object.values(exports["."]),
      ...["config", "sets", "sheet"].flatMap((entry) =>
        Object.values(exports["./*"]).map((target) =>
          target.replace("*", entry),
        ),
      ),
      exports["./*.svg"].replace("*", "sprite"),
    ];
    for (const target of targets) {
      expect(existsSync(`${root}${target}`), target).toBe(true);
    }
  });
});

describe("index", () => {
  it("lists every configured alias", () => {
    expect([...index.aliases].sort()).toEqual(expectedAliases);
  });

  it("recognises aliases and nothing else", () => {
    for (const alias of expectedAliases) {
      expect(index.isAlias(alias), alias).toBe(true);
    }
    expect(index.isAlias("not-an-icon")).toBe(false);
    expect(index.isAlias(undefined)).toBe(false);
    expect(index.isAlias(1)).toBe(false);
  });

  it("builds the sprite reference for an alias", () => {
    for (const alias of index.aliases) {
      expect(index.href(alias)).toBe(`#${index.prefix}${alias}`);
    }
  });

  it("types Alias as the union of configured aliases", () => {
    const [, union] = /export type Alias =([^;]+);/.exec(
      read(".output/index.d.mts"),
    )!;
    const members = [...union!.matchAll(/"([^"]+)"/g)].map(([, name]) => name);
    expect(members.sort()).toEqual(expectedAliases);
  });
});

describe("config", () => {
  it("carries the configured id and name", () => {
    expect(contract.contract.id).toBe(config.id);
    expect(contract.contract.name).toBe(config.name);
    expect(contract.default).toEqual({ contract: contract.contract });
  });

  it("resolves each alias to its Iconify icon", () => {
    expect(Object.keys(contract.contract.icons).sort()).toEqual(
      expectedAliases,
    );
    for (const alias of iconifyAliases) {
      expect(contract.contract.icons[alias], alias).toEqual(source(alias));
    }
  });

  it("resolves a local ref to the SVG file it names", () => {
    expect(localAliases).toContain("logo");
    for (const alias of localAliases) {
      const icon = contract.contract.icons[alias]!;
      const { viewBox } = local(alias);
      const [left, top, width, height] = viewBox.split(" ").map(Number);
      expect(icon, alias).toMatchObject({ left, top, width, height });
      expectLocalSymbol({ id: alias, viewBox, body: icon.body }, alias);
    }
  });
});

describe("sets", () => {
  it("is empty while no sets are configured", () => {
    expect(sets.default).toEqual({});
    expect(index.setIds).toEqual([]);
  });
});

describe("sprite", () => {
  const check = (list: Symbol[]) => {
    expect(list.map(({ id }) => id).sort()).toEqual(expectedAliases);
    const found = byId(list);
    for (const symbol of expectedSymbols) {
      expect(found[symbol.id], symbol.id).toEqual(symbol);
    }
    for (const alias of localAliases) expectLocalSymbol(found[alias], alias);
  };

  it("holds one symbol per alias, drawn from its Iconify icon or file", () => {
    check(symbols(read(".output/sprite.svg")));
  });

  it("inlines the same symbols as hidden markup", () => {
    expect(sheet.default).toMatch(/^<svg [^>]*style="display:none"/);
    check(symbols(sheet.default));
  });
});
