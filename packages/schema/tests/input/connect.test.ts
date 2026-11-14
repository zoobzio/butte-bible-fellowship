import { describe, expect, it } from "vitest";

import {
  connectArticle,
  connectBody,
  connectForm,
} from "../../src/input/connect";

const BARE = {
  title: "Connect",
  address: "2255 Pillsbury Road, Chico, California 95926",
};

const CONNECT = {
  ...BARE,
  description: "We’d love to meet you.",
  phone: "530-892-0521",
  fax: "530-898-1851",
  email: "office@bbfchurchchico.org",
  hours: "Tuesday–Thursday: 9am–4pm\nFriday: 9am–noon",
};

const ARTICLE = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "Come and see." }],
    },
  ],
};

const form = (value: unknown) =>
  connectForm
    .safeParse(value)
    .error?.issues.map((issue) => issue.path.join(".")) ?? [];

describe("connectBody", () => {
  it("writes the page's metadata with a title and an address alone, or with all it can say", () => {
    expect(connectBody.parse(BARE)).toEqual(BARE);
    expect(connectBody.parse(CONNECT)).toEqual(CONNECT);
  });

  it("needs a title and an address that say something", () => {
    for (const key of Object.keys(BARE)) {
      const { [key]: _, ...rest } = BARE as Record<string, unknown>;
      expect(connectBody.safeParse(rest).success, key).toBe(false);
      expect(connectBody.safeParse({ ...BARE, [key]: "" }).success, key).toBe(
        false,
      );
    }
  });

  it("carries neither what is written on the page nor a map of its own", () => {
    expect(
      connectBody.parse({ ...BARE, body: ARTICLE, map: "https://example.com" }),
    ).toEqual(BARE);
  });
});

describe("connectForm", () => {
  it("holds what the body takes, its title and address trimmed", () => {
    expect(
      connectForm.parse({ title: "  Connect  ", address: ` ${BARE.address} ` }),
    ).toEqual(BARE);
  });

  it("names a title or an address left blank, or holding only spaces", () => {
    expect(form({})).toEqual(["title", "address"]);
    expect(form({ title: "  ", address: " " })).toEqual(["title", "address"]);
  });

  it("keeps every other line as typed", () => {
    const page = { ...BARE, description: " Hello. ", hours: "9–5\n" };
    expect(connectForm.parse(page)).toEqual(page);
  });
});

describe("connectArticle", () => {
  it("is what is written on the page, as a tree, or nothing", () => {
    expect(connectArticle.parse({ body: ARTICLE })).toEqual({ body: ARTICLE });
    expect(connectArticle.parse({})).toEqual({});
  });

  it("rejects what is not a tree, and carries no metadata", () => {
    expect(connectArticle.safeParse({ body: "# Hi" }).success).toBe(false);
    expect(connectArticle.parse({ body: ARTICLE, title: "Connect" })).toEqual({
      body: ARTICLE,
    });
  });
});
