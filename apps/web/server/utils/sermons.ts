import type { Sermon } from "#shared/types/sermons";

/** A channel's feed: its latest fifteen sermons, newest first, as Atom. */
export const sermonFeedUrl = (channel: string): string => {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channel)}`;
};

const ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"',
};

/** XML text as it reads: its named and numeric character references resolved. */
const decode = (text: string): string => {
  return text.replace(
    /&(?:#x([0-9a-f]+)|#(\d+)|(\w+));/gi,
    (reference, hex?: string, decimal?: string, name?: string) => {
      if (hex) return String.fromCodePoint(Number.parseInt(hex, 16));
      if (decimal) return String.fromCodePoint(Number.parseInt(decimal, 10));
      return ENTITIES[name!] ?? reference;
    },
  );
};

/**
 * The sermons a channel's feed lists, in the feed's order. The feed is
 * machine-written and its shape fixed, so each field is read straight from
 * its tag rather than through an XML parser. An entry missing a field is
 * left out.
 */
export const parseSermonFeed = (xml: string): Sermon[] => {
  const sermons: Sermon[] = [];

  for (const [, entry = ""] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = /<yt:videoId>([^<]+)<\/yt:videoId>/.exec(entry)?.[1];
    const title = /<title>([^<]*)<\/title>/.exec(entry)?.[1];
    const published = /<published>([^<]+)<\/published>/.exec(entry)?.[1];
    const thumbnail = /<media:thumbnail\s[^>]*?url="([^"]+)"/.exec(entry)?.[1];

    if (id && title && published && thumbnail) {
      sermons.push({
        id: decode(id),
        title: decode(title),
        published,
        thumbnail: decode(thumbnail),
      });
    }
  }

  return sermons;
};
