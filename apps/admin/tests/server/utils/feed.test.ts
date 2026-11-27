import { describe, expect, it } from "vitest";

import {
  parseFeed,
  toEntries,
  toPreached,
  toSlug,
  toSummary,
  toTitle,
} from "~~/server/utils/feed";

const entry = (
  video: string,
  title: string,
  published: string,
  description = "",
) => `
 <entry>
  <id>yt:video:${video}</id>
  <yt:videoId>${video}</yt:videoId>
  <yt:channelId>UCtest</yt:channelId>
  <title>${title}</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=${video}"/>
  <author><name>Butte Bible Fellowship</name></author>
  <published>${published}</published>
  <updated>2026-11-01T00:00:00+00:00</updated>
  <media:group>
   <media:title>${title}</media:title>
   <media:content url="https://www.youtube.com/v/${video}" type="application/x-shockwave-flash" width="640" height="390"/>
   <media:thumbnail url="https://i.ytimg.com/vi/${video}/hqdefault.jpg" width="480" height="360"/>
   <media:description>${description}</media:description>
  </media:group>
 </entry>`;

const feed = (...entries: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <id>yt:channel:test</id>
 <title>Butte Bible Fellowship</title>
 <published>2015-01-01T00:00:00+00:00</published>${entries.join("")}
</feed>`;

describe("parseFeed", () => {
  it("reads each recording's id, title, description and when it was published, in the feed's order", () => {
    expect(
      parseFeed(
        feed(
          entry(
            "dQw4w9WgXcQ",
            "Faith &amp; Works",
            "2026-10-04T19:30:00+00:00",
            "James 2.\n\nJoin us Sundays at 10.",
          ),
          entry("a_b-c123456", "Grace", "2026-09-27T19:30:00+00:00"),
        ),
      ),
    ).toEqual([
      {
        video: "dQw4w9WgXcQ",
        title: "Faith & Works",
        published: "2026-10-04T19:30:00+00:00",
        description: "James 2.\n\nJoin us Sundays at 10.",
      },
      {
        video: "a_b-c123456",
        title: "Grace",
        published: "2026-09-27T19:30:00+00:00",
      },
    ]);
  });

  it("reads the channel's own title and time as no recording's", () => {
    expect(parseFeed(feed())).toEqual([]);
  });

  it("unescapes what XML escaped, by name and by number, and leaves the rest", () => {
    const [video] = parseFeed(
      feed(
        entry(
          "abc",
          "&lt;John&gt; 3:16 &quot;so loved&quot; &#8212; God&apos;s &#x2764; &nbsp; &#99999999;",
          "2026-10-04T19:30:00+00:00",
        ),
      ),
    );
    expect(video!.title).toBe(
      '<John> 3:16 "so loved" — God\'s ❤ &nbsp; &#99999999;',
    );
  });

  it("passes over an entry with no id, no title or no time it can read", () => {
    const whole = entry("abc", "Kept", "2026-10-04T19:30:00+00:00");
    expect(
      parseFeed(
        feed(
          whole.replace(/<yt:videoId>.*<\/yt:videoId>/, ""),
          whole.replace(/<title>.*<\/title>/, "<title></title>"),
          whole.replace(/<published>.*<\/published>/, ""),
          whole.replace(
            /<published>.*<\/published>/,
            "<published>soon</published>",
          ),
          whole,
        ),
      ).map((video) => video.title),
    ).toEqual(["Kept"]);
  });

  it("finds nothing in what is no feed", () => {
    expect(parseFeed("")).toEqual([]);
    expect(parseFeed("<!doctype html><title>Sign in</title>")).toEqual([]);
  });
});

describe("toPreached", () => {
  const TZ = "America/Los_Angeles";

  it("is the day published where that is a Sunday, in the zone given", () => {
    expect(toPreached("2026-10-04T19:30:00+00:00", TZ)).toBe("2026-10-04");
    // Sunday evening in California is Monday already in UTC.
    expect(toPreached("2026-10-05T03:00:00+00:00", TZ)).toBe("2026-10-04");
    expect(toPreached("2026-10-05T03:00:00+00:00", "UTC")).toBe("2026-10-04");
  });

  it("is the Sunday before any other day, across a month and a year", () => {
    expect(toPreached("2026-10-07T18:00:00+00:00", TZ)).toBe("2026-10-04");
    expect(toPreached("2026-10-11T06:59:00+00:00", TZ)).toBe("2026-10-04");
    expect(toPreached("2026-10-11T07:00:00+00:00", TZ)).toBe("2026-10-11");
    expect(toPreached("2026-12-01T18:00:00+00:00", TZ)).toBe("2026-11-29");
    expect(toPreached("2027-01-01T18:00:00+00:00", TZ)).toBe("2026-12-27");
  });
});

describe("toSlug", () => {
  it("joins a title's words in lowercase by single hyphens", () => {
    expect(toSlug("Faith & Works")).toBe("faith-works");
    expect(toSlug("  John 3:16 — “So Loved” ")).toBe("john-3-16-so-loved");
    expect(toSlug("Café Élan")).toBe("cafe-elan");
    expect(toSlug("The Lord's Supper")).toBe("the-lords-supper");
  });

  it("is sermon for a title with neither a letter nor a digit", () => {
    expect(toSlug("—")).toBe("sermon");
    expect(toSlug("")).toBe("sermon");
  });
});

describe("toTitle", () => {
  it("parts a name at its last dash into the title and who preached it", () => {
    expect(toTitle("Consequences - Pastor David")).toEqual({
      title: "Consequences",
      speaker: "Pastor David",
    });
    expect(toTitle("Love - A Heart Condition – Guest Speaker, Scott")).toEqual({
      title: "Love - A Heart Condition",
      speaker: "Guest Speaker, Scott",
    });
    expect(toTitle(" Grace — Pastor David ")).toEqual({
      title: "Grace",
      speaker: "Pastor David",
    });
  });

  it("is all title with no dash set off by spaces, or nothing on a side of one", () => {
    for (const name of [
      "Faith & Works",
      "Spirit-filled",
      "- Grace",
      "Grace -",
    ]) {
      expect(toTitle(name), name).toEqual({ title: name, speaker: null });
    }
  });
});

describe("toSummary", () => {
  it("is the first paragraph written, on one line", () => {
    expect(toSummary("James 2,\nand what faith does.\n\nJoin us.")).toBe(
      "James 2, and what faith does.",
    );
    expect(toSummary("  One line.  ")).toBe("One line.");
  });

  it("is none where nothing is written", () => {
    expect(toSummary(undefined)).toBeNull();
    expect(toSummary(" \n ")).toBeNull();
  });
});

describe("toEntries", () => {
  it("reads each recording as the sermons take it in", () => {
    expect(
      toEntries(
        [
          {
            video: "dQw4w9WgXcQ",
            title: "Faith & Works - Pastor Name",
            description: "James 2.\n\nJoin us.",
            published: "2026-10-07T18:00:00+00:00",
          },
        ],
        "America/Los_Angeles",
      ),
    ).toEqual([
      {
        video: "dQw4w9WgXcQ",
        title: "Faith & Works",
        speaker: "Pastor Name",
        summary: "James 2.",
        date: "2026-10-04",
        slug: "faith-works",
        fallback: "faith-works-dqw4w9wgxcq",
      },
    ]);
  });

  it("gives a title a feed lists twice its fallback the second time", () => {
    const videos = ["a_1", "b-2", "c3"].map((video) => ({
      video,
      title: "Sunday Service",
      published: "2026-10-04T19:30:00+00:00",
    }));
    expect(
      toEntries(videos, "UTC").map(({ slug, fallback }) => [slug, fallback]),
    ).toEqual([
      ["sunday-service", "sunday-service-a-1"],
      ["sunday-service-b-2", "sunday-service-b-2"],
      ["sunday-service-c3", "sunday-service-c3"],
    ]);
  });

  it("takes in nothing from an empty feed", () => {
    expect(toEntries([], "UTC")).toEqual([]);
  });
});
