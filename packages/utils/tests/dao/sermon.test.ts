import { describe, expect, it } from "vitest";

import { toSermonArguments } from "../../src/dao/sermon";

const SERMON = {
  id: "dQw4w9WgXcQ",
  title: "Faith & Works",
  published: "2026-10-04T18:16:28+00:00",
  thumbnail: "https://i4.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
};

describe("toSermonArguments", () => {
  it("takes the moment it was published as a Date", () => {
    expect(toSermonArguments(SERMON)).toEqual({
      id: "dQw4w9WgXcQ",
      title: "Faith & Works",
      published: new Date("2026-10-04T18:16:28Z"),
      thumbnail: "https://i4.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    });
  });

  it("keeps the moment whatever offset the feed wrote it in", () => {
    const { published } = toSermonArguments({
      ...SERMON,
      published: "2026-10-04T11:16:28-07:00",
    });
    expect(published.toISOString()).toBe("2026-10-04T18:16:28.000Z");
  });
});
