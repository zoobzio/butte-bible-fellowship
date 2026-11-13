import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { messages as layer } from "@zoobzio/prose";
import { makeProsary } from "prosary";
import { beforeAll, describe, expect, it } from "vitest";

import config from "../prosary.config";

type Descriptors = Record<string, { defaultMessage: string }>;

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (file: string) => readFileSync(`${root}${file}`, "utf8");

const list = (directory: string, extension: string) =>
  readdirSync(`${root}${directory}`, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(extension))
    .sort();

const { source: locale, targets = [] } = config.translate;
const source = Object.fromEntries(
  list(config.messages, ".json").flatMap((file) =>
    Object.entries(
      JSON.parse(read(`${config.messages}/${file}`)) as Descriptors,
    ).map(([key, descriptor]) => [
      `${file.slice(0, -".json".length).replaceAll("/", ".")}.${key}`,
      descriptor.defaultMessage,
    ]),
  ),
);

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
    const targets = Object.values(exports).flatMap((target) =>
      typeof target === "string" ? [target] : Object.values(target),
    );
    expect(targets.length).toBeGreaterThan(0);
    for (const target of targets) {
      expect(existsSync(`${root}${target}`), target).toBe(true);
    }
  });
});

describe("contract", () => {
  it("is written in the source locale alone", () => {
    expect(index.locale).toBe(locale);
    expect(index.locales).toEqual([locale, ...targets]);
  });

  it("lists every source message, the layer's with its own", () => {
    expect([...index.messages].sort()).toEqual(
      [...new Set([...layer, ...Object.keys(source)])].sort(),
    );
  });

  it("recognises its keys and locales and nothing else", () => {
    for (const key of Object.keys(source)) {
      expect(index.isKey(key), key).toBe(true);
    }
    expect(index.isKey("not.a.message")).toBe(false);
    expect(index.isLocale(locale)).toBe(true);
    expect(index.isLocale("xx")).toBe(false);
  });
});

describe("bundles", () => {
  it("formats every message as authored", async () => {
    const prosary = makeProsary(index.contract, {
      locale: index.locale,
      messages: await bundles.bundles[index.locale](),
    });
    const taking = [
      "appearance.scheme",
      "footer.copyright",
      "sermons.play",
      "events.day",
      "events.weekly",
      "events.monthly",
      "events.week",
      "admin.editor.confirm",
      "admin.member.photoConfirm",
      "admin.event.imageConfirm",
      "connect.map",
    ];
    for (const [key, message] of Object.entries(source)) {
      if (!taking.includes(key)) {
        expect(prosary.format(key as never), key).toBe(message);
      }
    }
    expect(prosary.format("appearance.scheme", { mode: "dark" })).toBe(
      "Switch to dark mode",
    );
    expect(prosary.format("appearance.scheme", { mode: "light" })).toBe(
      "Switch to light mode",
    );
    expect(prosary.format("footer.copyright", { year: "2026" })).toBe(
      "© 2026 Butte Bible Fellowship",
    );
    expect(prosary.format("sermons.play", { title: "Faith & Works" })).toBe(
      "Play “Faith & Works”",
    );
    expect(
      prosary.format("events.day", { date: "Sunday, October 4", count: 3 }),
    ).toBe("Sunday, October 4, 3 events");
    expect(prosary.format("events.weekly", { day: "Sunday" })).toBe(
      "Every Sunday",
    );
    expect(
      prosary.format("events.monthly", {
        weeks: "first and third",
        day: "Tuesday",
      }),
    ).toEqual("Every first and third Tuesday");
    expect(
      [1, 2, 3, 4, 5].map((week) => prosary.format("events.week", { week })),
    ).toEqual(["first", "second", "third", "fourth", "fifth"]);
    expect(
      prosary.format("connect.map", { address: "2255 Pillsbury Road" }),
    ).toBe("Map to 2255 Pillsbury Road");
    expect(
      prosary.format("admin.editor.confirm", { name: "Harvest Dinner" }),
    ).toBe("Delete Harvest Dinner? This cannot be undone.");
    expect(
      prosary.format("admin.member.photoConfirm", { name: "Jane Doe" }),
    ).toBe("Remove Jane Doe’s photo?");
    expect(
      prosary.format("admin.event.imageConfirm", { name: "Harvest Dinner" }),
    ).toBe("Remove the picture of Harvest Dinner?");
  });
});

describe("content", () => {
  it("builds no page: the site's pages are the database's", () => {
    expect([...index.documents]).toEqual([]);
  });

  it("names the form a page is served in, and what marks one of its blocks", () => {
    expect(index.content).toEqual({ output: "hast", marker: "dataDirective" });
  });
});
