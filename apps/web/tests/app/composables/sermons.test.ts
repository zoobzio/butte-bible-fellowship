import { afterEach, describe, expect, it, vi } from "vitest";

import { useSermons } from "~/composables/sermons";

const SERMON = {
  id: "abc123",
  title: "Faith & Works",
  published: "2026-10-04T18:16:28+00:00",
  thumbnail: "https://i4.ytimg.com/vi/abc123/hqdefault.jpg",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSermons", () => {
  it("resolves the sermons the site's API lists", async () => {
    const fetch = vi.fn(async () => [SERMON]);
    vi.stubGlobal("$fetch", fetch);
    const { data } = await useSermons();
    expect(fetch).toHaveBeenCalledWith("/api/sermons");
    expect(data.value).toEqual([SERMON]);
  });

  it("resolves a list that cannot be read to an empty one", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("feed unavailable");
      }),
    );
    const { data } = await useSermons();
    expect(data.value).toEqual([]);
  });
});
