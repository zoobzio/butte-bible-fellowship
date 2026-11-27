import type { H3Event } from "h3";

import { describe, expect, it, vi } from "vitest";

import { useYoutube } from "~~/server/composables/youtube";

vi.mock("nitropack/runtime", () => ({
  useRuntimeConfig: () => ({ public: { youtube: { channel: "UC test" } } }),
}));

const EVENT = {} as H3Event;

const FEED = `<feed>
 <entry>
  <yt:videoId>dQw4w9WgXcQ</yt:videoId>
  <title>Faith &amp; Works</title>
  <published>2026-10-04T19:30:00+00:00</published>
 </entry>
</feed>`;

/** YouTube, answering the feed with what is given. */
const answering = (body: string, init?: ResponseInit) => {
  const fetch = vi.fn(
    async (_url: string, _init?: RequestInit) => new Response(body, init),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
};

describe("useYoutube", () => {
  it("reads the recordings of the channel the config names from its public feed", async () => {
    const fetch = answering(FEED);
    expect(await useYoutube(EVENT).videos()).toEqual([
      {
        video: "dQw4w9WgXcQ",
        title: "Faith & Works",
        published: "2026-10-04T19:30:00+00:00",
      },
    ]);
    const [url, init] = fetch.mock.lastCall!;
    expect(url).toBe(
      "https://www.youtube.com/feeds/videos.xml?channel_id=UC%20test",
    );
    // The feed is not waited for without end.
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("answers 502 where YouTube does not answer with the feed", async () => {
    answering("Not found", { status: 404 });
    await expect(useYoutube(EVENT).videos()).rejects.toMatchObject({
      statusCode: 502,
      message: "YouTube answered 404",
    });
  });

  it("answers 502 where YouTube cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    await expect(useYoutube(EVENT).videos()).rejects.toMatchObject({
      statusCode: 502,
      message: "YouTube could not be reached",
    });
  });
});
