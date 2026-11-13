import type { ContentDocument } from "@bbf/utils";

import { contentPath, eventPath } from "@bbf/schema";

import { useContent } from "~~/server/composables/content";
import { useEvents } from "~~/server/composables/events";

// A document is asked for as the build named a page's: <slug>.json for a
// page of the site, and events/<slug>.json for an event's own.
const PAGE = /^([^/]+)\.json$/;
const EVENT = /^events\/([^/]+)\.json$/;

const pageOf = (path: string): string | undefined => {
  const found = contentPath.safeParse({ slug: PAGE.exec(path)?.[1] });
  return found.success ? found.data.slug : undefined;
};

const eventOf = (path: string): string | undefined => {
  const found = eventPath.safeParse({ slug: EVENT.exec(path)?.[1] });
  return found.success ? found.data.slug : undefined;
};

/**
 * The documents the database holds, as the content catalog asks for them:
 * the site's pages, and the events' own. They are written in one language,
 * so every locale is answered with the same one.
 */
export const useDocuments = () => {
  const content = useContent();
  const events = useEvents();

  const list = async (): Promise<string[]> => {
    const [pages, listed] = await Promise.all([content.list(), events.list()]);
    return [
      ...pages.map((slug) => `${slug}.json`),
      ...listed.map((event) => `events/${event.slug}.json`),
    ];
  };

  /** A page of the site, as the admin wrote it. */
  const page = async (slug: string): Promise<ContentDocument | undefined> =>
    (await content.fetch(slug)) ?? undefined;

  /** An event's own page: what is written about it, under its front matter. */
  const event = async (slug: string): Promise<ContentDocument | undefined> => {
    const found = await events.fetch(slug);
    if (found === null) return undefined;
    return {
      type: "root",
      data: {
        matter: {
          title: found.title,
          description: found.summary,
          image: found.image,
        },
      },
      children: found.body?.children ?? [],
    };
  };

  const get = async (path: string): Promise<ContentDocument | undefined> => {
    const named = pageOf(path);
    if (named !== undefined) return page(named);
    const held = eventOf(path);
    return held === undefined ? undefined : event(held);
  };

  return { list, get };
};
