import type { FeedEntry, FeedVideo } from "~~/server/types/feed";

/** What XML writes its own five characters as. */
const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

/** The last code point Unicode has: a numbered entity past it names none. */
const LAST_CODE_POINT = 1_114_111;

/**
 * Text as it was before XML escaped it: the five named entities and the
 * numbered ones, decimal or hex. Anything else is left as written.
 */
const unescape = (text: string): string =>
  text.replace(
    /&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi,
    (whole, decimal?: string, hex?: string, name?: string) => {
      if (name !== undefined) return ENTITIES[name] ?? whole;
      const point =
        decimal === undefined ? Number.parseInt(hex!, 16) : Number(decimal);
      return point <= LAST_CODE_POINT ? String.fromCodePoint(point) : whole;
    },
  );

/** What the first element of a name holds, within a run of XML. */
const within = (xml: string, name: string): string | undefined => {
  const found = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(
    xml,
  );
  return found === null ? undefined : unescape(found[1]!).trim();
};

/**
 * The recordings a channel's feed lists, in the feed's order, the newest
 * first. The feed is YouTube's own Atom, a flat run of entries, so each is
 * read by the elements it is known to carry and not as a document: an
 * entry with no id, no title or no time it was published is passed over,
 * and text that is no feed holds none.
 */
export const parseFeed = (xml: string): FeedVideo[] =>
  [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].flatMap(([, entry]) => {
    const video = within(entry!, "yt:videoId");
    const title = within(entry!, "title");
    const published = within(entry!, "published");
    if (!video || !title || !published) return [];
    if (Number.isNaN(Date.parse(published))) return [];
    const description = within(entry!, "media:description");
    return [{ video, title, published, ...(description && { description }) }];
  });

/**
 * The Sunday a recording was preached, as YYYY-MM-DD: the day it was
 * published, in the time zone given, or the Sunday before it. A sermon is
 * recorded on a Sunday and uploaded that day or in the week after.
 */
export const toPreached = (published: string, timeZone: string): string => {
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(published))
    .split("-")
    .map(Number);
  const local = new Date(Date.UTC(year!, month! - 1, day!));
  local.setUTCDate(local.getUTCDate() - local.getUTCDay());
  return local.toISOString().slice(0, 10);
};

/**
 * A title as a slug: its letters and digits in lowercase, without their
 * accents or apostrophes, each run of anything else a hyphen. One with
 * neither a letter
 * nor a digit is `sermon`.
 */
export const toSlug = (title: string): string =>
  title
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "sermon";

/**
 * What a recording is called on YouTube, as the sermon's title and who
 * preached it. The church names a recording `Title - Speaker`, so the last
 * hyphen or dash set off by spaces parts the two; a name with none, or
 * with nothing on a side of it, is all title.
 */
export const toTitle = (
  name: string,
): { title: string; speaker: string | null } => {
  const [, title, speaker] =
    /^(.*\S)\s+[-–—]\s+(\S.*)$/s.exec(name.trim()) ?? [];
  return title === undefined || speaker === undefined
    ? { title: name.trim(), speaker: null }
    : { title, speaker };
};

/**
 * The first paragraph of what is written under a recording, on one line:
 * what a card shows of it. None where nothing is written.
 */
export const toSummary = (description: string | undefined): string | null => {
  const [first] = (description ?? "").trim().split(/\n\s*\n/);
  const line = first!.replace(/\s+/g, " ").trim();
  return line === "" ? null : line;
};

/**
 * The recordings as the sermons take them in. Each goes by its title,
 * without who preached it, as a slug, and by that with its video's id after it where the slug is taken:
 * by a sermon held already, which the database sees to, or by a recording
 * earlier in the same feed, which is seen to here.
 */
export const toEntries = (
  videos: FeedVideo[],
  timeZone: string,
): FeedEntry[] => {
  const taken = new Set<string>();
  return videos.map(({ video, title: name, description, published }) => {
    const { title, speaker } = toTitle(name);
    const base = toSlug(title);
    const fallback = toSlug(`${base} ${video}`);
    const slug = taken.has(base) ? fallback : base;
    taken.add(slug);
    return {
      video,
      title,
      speaker,
      summary: toSummary(description),
      date: toPreached(published, timeZone),
      slug,
      fallback,
    };
  });
};
