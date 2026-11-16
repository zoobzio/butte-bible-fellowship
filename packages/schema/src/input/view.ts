import { keys, within } from "objectively";
import { z } from "zod";

import { viewSurface } from "../models/view";
import { LISTING_DEFAULT_SIZE, LISTING_MAX_SIZE } from "./listing";
import { DATE_OPERATORS, MATCH_OPERATORS, TEXT_OPERATORS } from "./operators";
import { STAFF_SORT_KEYS } from "./staff";

/** How long a view's name may be. */
export const VIEW_NAME_LENGTH = 80;

/** How many entries, a search's text and its filters, a view may hold. */
export const VIEW_ENTRIES_SIZE = 50;

/** How many columns a view may put in order. */
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
 * The schema of a view over one of the admin's tables: the table's
 * arrangement as it is saved, and as it is put back. `sorts` names the
 * columns the list's API sorts by and `columns` the ones it filters by, so
 * a view never asks the API for what it would refuse. The columns put in
 * order, shown or hidden, and sized are the table's own to name, and are
 * left as they come. Every member has a default, so a view saved before a
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
    entries: z
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
      .max(VIEW_ENTRIES_SIZE)
      .default([])
      .meta({
        description:
          "The search: the text looked for, and a filter for each column and operator narrowed by.",
      }),
  });

/** The columns of the staff a view may filter by: the list's own filters. */
export const STAFF_VIEW_COLUMNS = [
  "name",
  "role",
  "email",
  "phone",
  "summary",
  "photo",
  "updatedAt",
  "createdAt",
] as const;

export const staffView = tableView({
  sorts: STAFF_SORT_KEYS,
  columns: STAFF_VIEW_COLUMNS,
}).meta({
  id: "StaffView",
  description:
    "A view of the staff: the table's sort, its columns, its page's size and its search.",
});

/**
 * The schema each list's views are held to, by the list's name: what a
 * view's payload is checked against before it is saved, and what the admin
 * reads a stored one through.
 */
export const VIEW_PAYLOADS = {
  staff: staffView,
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

export const staffViewBody = viewBody(staffView).meta({
  id: "StaffViewBody",
  description:
    "A view of the staff as it is saved: what a save writes, or replaces.",
});

/** What a save of a view carries, by the list the view is of. */
export const VIEW_BODIES = {
  staff: staffViewBody,
} satisfies Record<z.infer<typeof viewSurface>, z.ZodType>;
