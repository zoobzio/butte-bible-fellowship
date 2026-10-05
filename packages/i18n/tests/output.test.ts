import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { makeFibber } from "fibber-lang";
import { beforeAll, describe, expect, it } from "vitest";

import config from "../fibber.config";

type Descriptors = Record<string, { defaultMessage: string }>;

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (file: string) => readFileSync(`${root}${file}`, "utf8");

/** The files under a source directory with an extension, sorted. */
const list = (directory: string, extension: string) =>
  readdirSync(`${root}${directory}`)
    .filter((file) => file.endsWith(extension))
    .sort();

// Every source message by its full key: the file's name, then its own key.
const source = Object.fromEntries(
  list(config.source, ".json").flatMap((file) =>
    Object.entries(
      JSON.parse(read(`${config.source}/${file}`)) as Descriptors,
    ).map(([key, descriptor]) => [
      `${file.slice(0, -".json".length)}.${key}`,
      descriptor.defaultMessage,
    ]),
  ),
);

const pages = list(config.content!, ".md");

let index: typeof import("../.output/index.mjs");
let bundles: typeof import("../.output/bundles.mjs");

beforeAll(async () => {
  execFileSync("pnpm", ["run", "build"], { cwd: root, stdio: "pipe" });
  index = await import("../.output/index.mjs");
  bundles = await import("../.output/bundles.mjs");
});

describe("package exports", () => {
  it("point at files the build writes", () => {
    const { exports } = JSON.parse(read("package.json")) as {
      exports: Record<string, string | Record<string, string>>;
    };
    const targets = Object.values(exports)
      .flatMap((target) =>
        typeof target === "string" ? [target] : Object.values(target),
      )
      .map((target) => target.replace("*", `${config.locale}/${pages[0]}`));
    expect(targets.length).toBeGreaterThan(0);
    for (const target of targets) {
      expect(existsSync(`${root}${target}`), target).toBe(true);
    }
  });
});

describe("contract", () => {
  it("is written in the source locale alone", () => {
    expect(index.locale).toBe(config.locale);
    expect(index.locales).toEqual([config.locale, ...(config.locales ?? [])]);
  });

  it("lists every source message", () => {
    expect([...index.messages].sort()).toEqual(Object.keys(source).sort());
  });

  it("recognises its keys and locales and nothing else", () => {
    for (const key of Object.keys(source)) {
      expect(index.isKey(key), key).toBe(true);
    }
    expect(index.isKey("not.a.message")).toBe(false);
    expect(index.isLocale(config.locale)).toBe(true);
    expect(index.isLocale("xx")).toBe(false);
  });
});

describe("bundles", () => {
  it("formats every message as authored", async () => {
    const fibber = makeFibber(index.contract, {
      locale: index.locale,
      messages: await bundles.bundles[index.locale](),
    });
    // The two messages that take a value are formatted with one below.
    const taking = ["appearance.scheme", "footer.copyright"];
    for (const [key, message] of Object.entries(source)) {
      if (!taking.includes(key)) {
        expect(fibber.format(key as never), key).toBe(message);
      }
    }
    expect(fibber.format("appearance.scheme", { mode: "dark" })).toBe(
      "Switch to dark mode",
    );
    expect(fibber.format("appearance.scheme", { mode: "light" })).toBe(
      "Switch to light mode",
    );
    expect(fibber.format("footer.copyright", { year: "2026" })).toBe(
      "© 2026 Butte Bible Fellowship",
    );
  });
});

describe("content", () => {
  it("lists every page", () => {
    expect([...index.documents]).toEqual(pages);
  });

  it("builds every page as authored", () => {
    for (const page of pages) {
      expect(read(`.output/content/${config.locale}/${page}`), page).toBe(
        read(`${config.content}/${page}`),
      );
    }
  });
});
