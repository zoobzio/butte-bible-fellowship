import { describe, expect, it } from "vitest";

import { sermon, sermons } from "../src/sermons";

const SERMON = {
  id: "abc123",
  title: "Faith & Works",
  published: "2026-10-04T18:16:28+00:00",
  thumbnail: "https://i4.ytimg.com/vi/abc123/hqdefault.jpg",
};

describe("sermon", () => {
  it("accepts a sermon as the feed lists it", () => {
    expect(sermon.parse(SERMON)).toEqual(SERMON);
  });

  it("accepts a timestamp in UTC as well as with an offset", () => {
    expect(
      sermon.safeParse({ ...SERMON, published: "2026-10-04T18:16:28Z" })
        .success,
    ).toBe(true);
  });

  it("rejects a sermon with an empty id", () => {
    expect(sermon.safeParse({ ...SERMON, id: "" }).success).toBe(false);
  });

  it("rejects a published date that is not a timestamp", () => {
    expect(
      sermon.safeParse({ ...SERMON, published: "2026-10-04" }).success,
    ).toBe(false);
  });

  it("rejects a thumbnail that is not a URL", () => {
    expect(
      sermon.safeParse({ ...SERMON, thumbnail: "hqdefault.jpg" }).success,
    ).toBe(false);
  });
});

describe("sermons", () => {
  it("accepts a list, and an empty one", () => {
    expect(sermons.parse([SERMON])).toEqual([SERMON]);
    expect(sermons.parse([])).toEqual([]);
  });

  it("rejects what is not a list", () => {
    expect(sermons.safeParse({ sermons: [SERMON] }).success).toBe(false);
  });
});
