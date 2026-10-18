import { afterEach, describe, expect, it, vi } from "vitest";

import {
  useRecentSermons,
  useSermonImage,
  useSermons,
} from "~/composables/sermons";

const SERMON = {
  slug: "faith-and-works",
  title: "Faith & Works",
  video: "abc123",
  date: "2026-10-04",
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
      vi.fn(async () => [{ ...SERMON, date: "not a day" }]),
    );
    const { data } = await useSermons();
    expect(data.value).toEqual([]);
  });

  it("resolves a list that cannot be read to an empty one", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("database unavailable");
      }),
    );
    const { data } = await useSermons();
    expect(data.value).toEqual([]);
  });
});

describe("useRecentSermons", () => {
  const sermons = ["a", "b", "c", "d"].map((slug) => ({ ...SERMON, slug }));

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
        throw new Error("database unavailable");
      }),
    );
    expect((await useRecentSermons()).value).toEqual([]);
  });
});

describe("useSermonImage", () => {
  const image = useSermonImage();

  it("is the sermon's own picture when it names one", () => {
    expect(
      image({ ...SERMON, image: "https://cdn.example.com/sermons/faith.jpg" }),
    ).toBe("https://cdn.example.com/sermons/faith.jpg");
  });

  it("is the video's thumbnail on YouTube when it names none", () => {
    expect(image(SERMON)).toBe("https://i.ytimg.com/vi/abc123/hqdefault.jpg");
  });

  it("is nothing for a sermon with neither a picture nor a video", () => {
    expect(image({ ...SERMON, video: undefined })).toBeUndefined();
  });
});
