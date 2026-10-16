import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { makeProsary } from "prosary";
import { beforeAll, describe, expect, it } from "vitest";

import config from "../prosary.config";

type Descriptors = Record<string, { defaultMessage: string }>;

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (file: string) => readFileSync(`${root}${file}`, "utf8");

/**
 * The files under a source directory with an extension, sorted: those in
 * its own directories among them, by their path from it.
 */
const list = (directory: string, extension: string) =>
  readdirSync(`${root}${directory}`, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(extension))
    .sort();

const { source: locale, targets = [] } = config.translate;
const content =
  typeof config.content === "string" ? config.content : config.content!.dir;

// Every source message by its full key: the file's name, then its own key.
const source = Object.fromEntries(
  list(config.messages, ".json").flatMap((file) =>
    Object.entries(
      JSON.parse(read(`${config.messages}/${file}`)) as Descriptors,
    ).map(([key, descriptor]) => [
      `${file.slice(0, -".json".length)}.${key}`,
      descriptor.defaultMessage,
    ]),
  ),
);

const pages = list(content, ".md");

/** A page's front matter title, as written. */
const titleOf = (page: string) =>
  /^title: (.*)$/m.exec(read(`${content}/${page}`))?.[1];

/** A page as built: the tree of its body, its front matter on the root. */
const built = (locale: string, page: string) =>
  JSON.parse(
    read(`.output/content/${locale}/${page.replace(/\.md$/, ".json")}`),
  ) as {
    type: string;
    data?: { matter?: Record<string, unknown> };
    children: { type: string; tagName?: string; properties?: object }[];
  };

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

  it("lists every source message", () => {
    expect([...index.messages].sort()).toEqual(Object.keys(source).sort());
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
    // The messages that take a value are formatted with one below.
    const taking = [
      "appearance.scheme",
      "footer.copyright",
      "sermons.play",
      "events.day",
      "events.weekly",
      "events.monthly",
      "events.week",
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
  });
});

describe("content", () => {
  it("lists every page", () => {
    expect([...index.documents]).toEqual(pages);
  });

  it("builds every page, in every locale, as the tree the app renders", () => {
    expect(index.content.output).toBe("hast");
    for (const target of index.locales) {
      for (const page of pages) {
        expect(built(target, page).type, `${target}/${page}`).toBe("root");
      }
    }
  });

  it("carries each page's front matter on its root, as authored", () => {
    for (const page of pages) {
      expect(built(locale, page).data?.matter?.title, page).toBe(titleOf(page));
    }
  });

  it("gives every heading an id, for a page's table of contents", () => {
    const headings = built(locale, "about-us.md").children.filter(
      (node) => node.type === "element" && /^h[1-6]$/.test(node.tagName!),
    );
    expect(headings.length).toBeGreaterThan(0);
    for (const heading of headings) {
      expect(heading.properties).toHaveProperty("id");
    }
  });

  it("builds the site's blocks as the components the app renders", () => {
    const marked = (locale: string, page: string): string[] => {
      const names: string[] = [];
      const walk = (node: { properties?: object; children?: unknown[] }) => {
        const directive = (node.properties as { dataDirective?: string })
          ?.dataDirective;
        if (directive !== undefined) names.push(directive);
        for (const child of node.children ?? []) walk(child as typeof node);
      };
      walk(built(locale, page));
      return names;
    };
    expect(marked(locale, "connect.md")).toEqual([
      "connect-grid",
      "connect-card",
      "connect-card",
      "map-embed",
    ]);
    expect(marked(locale, "index.md")).toEqual([
      "invite-grid",
      "invite-card",
      "invite-card",
      "invite-card",
    ]);
    // The pages quote Scripture by chapter and verse: a colon in prose
    // is prose, never a component.
    expect(marked(locale, "about-us.md")).toEqual([]);
  });
});
