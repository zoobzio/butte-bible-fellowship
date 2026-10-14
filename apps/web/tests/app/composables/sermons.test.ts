import { afterEach, describe, expect, it, vi } from "vitest";

import { useRecentSermons, useSermons } from "~/composables/sermons";

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

  it("resolves a list that is not sermons to an empty one", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => [{ ...SERMON, thumbnail: "not a url" }]),
    );
    const { data } = await useSermons();
    expect(data.value).toEqual([]);
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

describe("useRecentSermons", () => {
  const sermons = ["a", "b", "c", "d"].map((id) => ({ ...SERMON, id }));

  it("resolves the newest sermons, three unless told otherwise", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => sermons),
    );
    expect((await useRecentSermons()).value).toEqual(sermons.slice(0, 3));
    expect((await useRecentSermons(2)).value).toEqual(sermons.slice(0, 2));
  });

  it("resolves to none when none can be read", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("feed unavailable");
      }),
    );
    expect((await useRecentSermons()).value).toEqual([]);
  });
});

describe("useRecentSermons", () => {
  const sermons = ["a", "b", "c", "d"].map((id) => ({ ...SERMON, id }));

  it("resolves the newest sermons, three unless told otherwise", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => sermons),
    );
    expect((await useRecentSermons()).value).toEqual(sermons.slice(0, 3));
    expect((await useRecentSermons(2)).value).toEqual(sermons.slice(0, 2));
  });

  it("resolves to none when none can be read", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("feed unavailable");
      }),
    );
    expect((await useRecentSermons()).value).toEqual([]);
  });
});
