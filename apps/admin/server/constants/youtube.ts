/**
 * Where YouTube publishes a channel's latest uploads, the fifteen newest,
 * as an Atom feed: public, and read with no key.
 */
export const FEED = "https://www.youtube.com/feeds/videos.xml";

/** How long the feed is waited for before the sync gives up on it. */
export const FEED_TIMEOUT = 10_000;
