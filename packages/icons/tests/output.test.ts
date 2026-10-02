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

/** What each alias should resolve to, read from its Iconify collection. */
const source = (alias: string) => {
  const [collection, name] = config.icons[alias]!.split(":") as [string, string];
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
  [...svg.matchAll(/<symbol id="([^"]+)" viewBox="([^"]+)">(.*?)<\/symbol>/g)].map(
    ([, id, viewBox, body]) => ({ id: id!, viewBox: viewBox!, body: body! }),
  );

const expectedSymbols: Symbol[] = expectedAliases.map((alias) => {
  const { body, width, height } = source(alias);
  return { id: alias, viewBox: `0 0 ${width} ${height}`, body };
});

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
    for (const alias of expectedAliases) {
      expect(contract.contract.icons[alias], alias).toEqual(source(alias));
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
  it("holds one symbol per alias, drawn from its Iconify icon", () => {
    expect(symbols(read(".output/sprite.svg"))).toEqual(expectedSymbols);
  });

  it("inlines the same symbols as hidden markup", () => {
    expect(sheet.default).toMatch(/^<svg [^>]*style="display:none"/);
    expect(symbols(sheet.default)).toEqual(expectedSymbols);
  });
});
