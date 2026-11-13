import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useContent } from "~~/server/composables/content";

const PARAGRAPH = {
  type: "element",
  tagName: "p",
  properties: {},
  children: [{ type: "text", value: "Visit us." }],
};

const ROW = {
  slug: "connect",
  title: "Connect – Test Church",
  description: "Visit us.",
  body: { type: "root", children: [PARAGRAPH] },
};

const list = vi.fn(async () => [{ slug: "connect" }, { slug: "index" }]);
const first = vi.fn(async (args: { slug: string }) =>
  args.slug === ROW.slug ? ROW : null,
);

Object.assign(service, { web: { content: { list, fetch: { first } } } });

afterEach(() => {
  list.mockClear();
  first.mockClear();
});

describe("useContent", () => {
  it("lists the slug of every page", async () => {
    expect(await useContent().list()).toEqual(["connect", "index"]);
  });

  it("reads a page by its slug, as a document", async () => {
    expect(await useContent().fetch("connect")).toEqual({
      type: "root",
      data: {
        matter: { title: "Connect – Test Church", description: "Visit us." },
      },
      children: [PARAGRAPH],
    });
    expect(first).toHaveBeenCalledWith({ slug: "connect" });
  });

  it("reads nothing for a page the database does not hold", async () => {
    expect(await useContent().fetch("nope")).toBeNull();
  });
});
