import { keys, within } from "objectively";
import { z } from "zod";

import { viewSurface } from "../models/view";
import { CONTENT_SORT_KEYS } from "./content";
import {
  LISTING_DEFAULT_SIZE,
  LISTING_MAX_SIZE,
  SORT_DIRECTIONS,
} from "./listing";
import { DATE_OPERATORS, MATCH_OPERATORS, TEXT_OPERATORS } from "./operators";
import { PERSON_SORT_KEYS } from "./person";

/** How long a view's name may be. */
export const VIEW_NAME_LENGTH = 80;

/** How many clauses, a search's text and its filters, a view may hold. */
export const VIEW_CLAUSES_SIZE = 50;

/** How many columns a view may put in order, or pin to a side. */
export const VIEW_COLUMNS_SIZE = 100;

/** Every operator a filter may name, whatever the kind of column. */
const OPERATORS = keys({
  ...TEXT_OPERATORS,
  ...DATE_OPERATORS,
  ...MATCH_OPERATORS,
});

/** A text that is one of a list's own, and stays typed as text. */
const among = (values: readonly string[], what: string) =>
  z.string().refine((value) => within(values, value), {
    error: `Not ${what} of the list.`,
  });

/**
 * The search a view holds, over the columns its list's API filters by: the
 * text looked for, and a filter for each column and operator narrowed by.
 */
const clauses = (columns: readonly string[]) =>
  z
    .array(
      z.discriminatedUnion("kind", [
        z.object({
          kind: z.literal("literal"),
          key: z.string().min(1),
          value: z.string(),
        }),
        z.object({
          kind: z.literal("filter"),
          key: among(columns, "a column to filter by"),
          op: among(OPERATORS, "an operator").optional(),
          value: z.string(),
        }),
      ]),
    )
    .max(VIEW_CLAUSES_SIZE)
    .default([])
    .meta({
      description:
        "The search: the text looked for, and a filter for each column and operator narrowed by.",
    });

/**
 * The schema of a view over one of the admin's tables: the table's
 * arrangement as it is saved, and as it is put back. `sorts` names the
 * columns the list's API sorts by and `columns` the ones it filters by, so
 * a view never asks the API for what it would refuse. The columns put in
 * order, pinned to a side, shown or hidden, and sized are the table's own
 * to name, and are left as they come. Every member has a default, so a view saved before a
 * member existed still reads.
 *
 * What it yields is the table's snapshot, member for member: the keys
 * stay text, checked and not narrowed, so the table reads and takes it as
 * it is.
 */
export const tableView = ({
  sorts,
  columns,
}: {
  sorts: readonly string[];
  columns: readonly string[];
}) =>
  z.object({
    sorting: z
      .array(
        z.object({
          id: among(sorts, "a column to sort by"),
          desc: z.boolean(),
        }),
      )
      .max(sorts.length)
      .default([])
      .meta({
        description:
          "The columns the list is sorted by, the first the one that leads. Empty, the list's own order.",
      }),
    columnOrder: z.array(z.string()).max(VIEW_COLUMNS_SIZE).default([]).meta({
      description: "The columns in the order they stand. Empty, their own.",
    }),
    columnPinning: z
      .object({
        start: z.array(z.string()).max(VIEW_COLUMNS_SIZE).default([]),
        end: z.array(z.string()).max(VIEW_COLUMNS_SIZE).default([]),
      })
      .default({ start: [], end: [] })
      .meta({
        description:
          "The columns pinned to the start of the table and to its end, each side in the order they stand. One left out scrolls with the rest.",
      }),
    columnVisibility: z.record(z.string(), z.boolean()).default({}).meta({
      description: "Whether each column named is shown. One left out is shown.",
    }),
    columnSizing: z.record(z.string(), z.number()).default({}).meta({
      description:
        "The width of each column named, in pixels. One left out keeps its own.",
    }),
    pageSize: z
      .int()
      .positive()
      .max(LISTING_MAX_SIZE)
      .default(LISTING_DEFAULT_SIZE)
      .meta({
        description: "How many rows to a page.",
        examples: [25],
      }),
    clauses: clauses(columns),
  });

/** The columns of the people a view may filter by: the list's own filters. */
export const PEOPLE_VIEW_COLUMNS = [
  "name",
  "role",
  "title",
  "email",
  "phone",
  "summary",
  "address",
  "photo",
  "updatedAt",
  "createdAt",
] as const;

export const peopleView = tableView({
  sorts: PERSON_SORT_KEYS,
  columns: PEOPLE_VIEW_COLUMNS,
}).meta({
  id: "PeopleView",
  description:
    "A view of the people: the table's sort, its columns, its page's size and its search.",
});

/**
 * The schema of a view over one of the admin's browsers: the browser's
 * arrangement as it is saved, and as it is put back. A browser sorts by
 * one column at a time, and has neither columns to arrange nor pages, so
 * its view is the sort and the search alone: `sorts` names the columns the
 * list's API sorts by and `columns` the ones it filters by, as a table's
 * do. The folder that is open is no part of it: a view is put in place in
 * whichever folder the browser stands in. Every member has a default, so a
 * view saved before a member existed still reads.
 *
 * What it yields is the browser's snapshot, member for member.
 */
export const browserView = ({
  sorts,
  columns,
}: {
  sorts: readonly string[];
  columns: readonly string[];
}) =>
  z.object({
    sortField: among(sorts, "a column to sort by")
      .nullable()
      .default(null)
      .meta({
        description:
          "The column the list is sorted by. None, the list's own order.",
      }),
    sortDirection: z.enum(SORT_DIRECTIONS).default("asc").meta({
      description: "Which way the list is sorted.",
    }),
    clauses: clauses(columns),
  });

/**
 * The columns of the content a view may filter by: the documents' own
 * filters.
 */
export const CONTENT_VIEW_COLUMNS = [
  "title",
  "slug",
  "mime",
  "updatedAt",
] as const;

export const contentView = browserView({
  sorts: CONTENT_SORT_KEYS,
  columns: CONTENT_VIEW_COLUMNS,
}).meta({
  id: "ContentView",
  description:
    "A view of the content: the browser's sort and its search, put in place in whichever folder is open.",
});

/**
 * How much of time a calendar may show at once: a month, a week, a day, or
 * the days to come as a list.
 */
export const CALENDAR_SPANS = ["month", "week", "day", "agenda"] as const;

type CalendarSpan = (typeof CALENDAR_SPANS)[number];

/**
 * The schema of a view over one of the admin's calendars: the calendar's
 * arrangement as it is saved, and as it is put back. A calendar has
 * neither a sort nor columns nor pages, so its view is how much of time it
 * shows at once and the search alone: `views` names the ones the calendar
 * offers, the first the one a view left without takes, and `columns` the
 * ones the list's API filters by, as a table's do. The day the calendar
 * stands on is no part of it: a view is put in place on whichever day that
 * is. Every member has a default, so a view saved before a member existed
 * still reads.
 *
 * What it yields is the calendar's snapshot, member for member: the view
 * stays any a calendar may show, checked and not narrowed, so the calendar
 * reads and takes it as it is.
 */
export const calendarView = ({
  views,
  columns,
}: {
  views: readonly [CalendarSpan, ...CalendarSpan[]];
  columns: readonly string[];
}) =>
  z.object({
    view: z
      .enum(CALENDAR_SPANS)
      .refine((value) => within(views, value), {
        error: "Not a view of the calendar.",
      })
      .default(views[0])
      .meta({
        description: "How much of time the calendar shows at once.",
      }),
    clauses: clauses(columns),
  });

/**
 * How much of time the events' calendar shows at once: a month, a week, or
 * the days to come as a list.
 */
export const EVENT_CALENDAR_VIEWS = ["month", "week", "agenda"] as const;

/**
 * The columns of the events a view may filter by: the calendar's own
 * filters. The date an event is held is not among them: the days the
 * calendar shows are its span.
 */
export const EVENT_VIEW_COLUMNS = [
  "title",
  "day",
  "recurring",
  "slug",
  "summary",
  "image",
] as const;

export const eventView = calendarView({
  views: EVENT_CALENDAR_VIEWS,
  columns: EVENT_VIEW_COLUMNS,
}).meta({
  id: "EventView",
  description:
    "A view of the events: how much of time the calendar shows at once and its search, put in place on whichever day the calendar stands on.",
});

/**
 * The schema each list's views are held to, by the list's name: what a
 * view's payload is checked against before it is saved, and what the admin
 * reads a stored one through.
 */
export const VIEW_PAYLOADS = {
  people: peopleView,
  content: contentView,
  events: eventView,
} satisfies Record<z.infer<typeof viewSurface>, z.ZodType>;

export const viewList = z.object({
  surface: viewSurface,
});

export const viewPath = viewList.extend({
  id: z.uuid().meta({
    description:
      "What names the view: a UUID whoever saves it makes, before it is stored.",
    examples: ["0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f"],
  }),
});

/**
 * A view as it is saved, over the schema of its list's payload: its name,
 * and the arrangement it holds.
 */
export const viewBody = <P extends z.ZodType>(payload: P) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(VIEW_NAME_LENGTH)
      .meta({
        description: "What the view is called.",
        examples: ["Elders"],
      }),
    payload,
  });

export const peopleViewBody = viewBody(peopleView).meta({
  id: "PeopleViewBody",
  description:
    "A view of the people as it is saved: what a save writes, or replaces.",
});

export const contentViewBody = viewBody(contentView).meta({
  id: "ContentViewBody",
  description:
    "A view of the content as it is saved: what a save writes, or replaces.",
});

export const eventViewBody = viewBody(eventView).meta({
  id: "EventViewBody",
  description:
    "A view of the events as it is saved: what a save writes, or replaces.",
});

/** What a save of a view carries, by the list the view is of. */
export const VIEW_BODIES = {
  people: peopleViewBody,
  content: contentViewBody,
  events: eventViewBody,
} satisfies Record<z.infer<typeof viewSurface>, z.ZodType>;
