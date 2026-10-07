import { describe, expect, it } from "vitest";

import { parseSermonFeed, sermonFeedUrl } from "../../../server/utils/sermons";

const entry = (fields: string) => `<entry>${fields}</entry>`;

const FIRST = `
  <id>yt:video:abc123</id>
  <yt:videoId>abc123</yt:videoId>
  <yt:channelId>UCtest</yt:channelId>
  <title>Faith &amp; Works &#8211; James 2</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=abc123"/>
  <author><name>Test Church</name></author>
  <published>2026-10-04T18:16:28+00:00</published>
  <updated>2026-10-04T22:01:42+00:00</updated>
  <media:group>
    <media:title>Faith &amp; Works &#8211; James 2</media:title>
    <media:thumbnail url="https://i4.ytimg.com/vi/abc123/hqdefault.jpg?a=1&amp;b=2" width="480" height="360"/>
    <media:description>James 2</media:description>
  </media:group>`;

const SECOND = `
  <yt:videoId>def456</yt:videoId>
  <title>It&apos;s &#x201C;Good&#x201D; News</title>
  <published>2026-09-27T18:17:36+00:00</published>
  <media:group>
    <media:thumbnail url="https://i3.ytimg.com/vi/def456/hqdefault.jpg" width="480" height="360"/>
  </media:group>`;

const feed = (...entries: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <title>Test Church</title>
 <published>2024-12-03T00:43:42+00:00</published>
 ${entries.map(entry).join("\n")}
</feed>`;

describe("sermonFeedUrl", () => {
  it("is the channel's feed on YouTube", () => {
    expect(sermonFeedUrl("UCtest")).toBe(
      "https://www.youtube.com/feeds/videos.xml?channel_id=UCtest",
    );
  });
});

describe("parseSermonFeed", () => {
  it("reads each entry's id, title, date and thumbnail, in the feed's order", () => {
    expect(parseSermonFeed(feed(FIRST, SECOND))).toEqual([
      {
        id: "abc123",
        title: "Faith & Works – James 2",
        published: "2026-10-04T18:16:28+00:00",
        thumbnail: "https://i4.ytimg.com/vi/abc123/hqdefault.jpg?a=1&b=2",
      },
      {
        id: "def456",
        title: "It's “Good” News",
        published: "2026-09-27T18:17:36+00:00",
        thumbnail: "https://i3.ytimg.com/vi/def456/hqdefault.jpg",
      },
    ]);
  });

  it("leaves a reference it does not know as written", () => {
    const [sermon] = parseSermonFeed(
      feed(SECOND.replace("It&apos;s", "It&nbsp;is")),
    );
    expect(sermon!.title).toBe("It&nbsp;is “Good” News");
  });

  it("leaves out an entry missing a field", () => {
    const untitled = SECOND.replace(/<title>.*<\/title>/, "");
    expect(parseSermonFeed(feed(untitled, FIRST)).map(({ id }) => id)).toEqual([
      "abc123",
    ]);
  });

  it("reads a feed with no entries, or none at all, as no sermons", () => {
    expect(parseSermonFeed(feed())).toEqual([]);
    expect(parseSermonFeed("")).toEqual([]);
  });
});
