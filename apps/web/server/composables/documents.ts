import type { Hast, Page } from "@bbf/schema/types";

import { eventPath } from "@bbf/schema";

import { useEvents } from "~~/server/composables/events";

/**
 * An event's own page as a content document: what is written about it, under
 * the front matter a page carries, as the build writes a page's.
 */
export interface EventDocument {
  type: "root";
  data: { matter: Page };
  children: Hast["children"];
}

// A document is asked for as the build names a page's: events/<slug>.json.
const DOCUMENT = /^events\/([^/]+)\.json$/;

const pathOf = (slug: string): string => `events/${slug}.json`;

const slugOf = (path: string): string | undefined => {
  const found = eventPath.safeParse({ slug: DOCUMENT.exec(path)?.[1] });
  return found.success ? found.data.slug : undefined;
};

/**
 * The documents the database holds, as the content catalog asks for them:
 * the events' own pages. They are written in one language, so every locale
 * is answered with the same one.
 */
export const useDocuments = () => {
  const events = useEvents();

  const list = async (): Promise<string[]> => {
    const listed = await events.list();
    return listed.map((event) => pathOf(event.slug));
  };

  const get = async (path: string): Promise<EventDocument | undefined> => {
    const slug = slugOf(path);
    if (slug === undefined) return undefined;
    const event = await events.fetch(slug);
    if (event === null) return undefined;
    return {
      type: "root",
      data: {
        matter: {
          title: event.title,
          description: event.summary,
          image: event.image,
        },
      },
      children: event.body?.children ?? [],
    };
  };

  return { list, get };
};
