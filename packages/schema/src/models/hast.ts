import { z } from "zod";

/** What an element's attribute holds: a string, a number, a flag, or a list of tokens such as class names. */
const hastPropertyValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string(), z.number()])),
]);

/** A run of text in the tree. */
export const hastText = z
  .object({
    type: z.literal("text"),
    value: z.string().meta({ examples: ["Has served since 2010."] }),
  })
  .meta({ id: "HastText", description: "A run of text." });

/**
 * An HTML element: its tag, its attributes as `hast` names them —
 * `className` for `class`, `dataDirective` for `data-directive` — and what
 * it holds.
 */
export const hastElement = z
  .object({
    type: z.literal("element"),
    tagName: z.string().meta({ examples: ["p"] }),
    properties: z.record(z.string(), hastPropertyValue).meta({
      description:
        "Its attributes, named as hast names them: className for class, dataDirective for data-directive.",
    }),
    get children(): z.ZodArray<
      z.ZodUnion<[typeof hastElement, typeof hastText]>
    > {
      return z.array(z.union([hastElement, hastText]));
    },
  })
  .meta({
    id: "HastElement",
    description: "An HTML element: its tag, its attributes, and what it holds.",
  });

/**
 * Rich text as the API serves it: the HTML syntax tree
 * ([hast](https://github.com/syntax-tree/hast)) a Markdown column is built
 * to, the same tree the site's pages are built to, which the app renders
 * with its own components. Elements and text, with no positions.
 */
export const hast = z
  .object({
    type: z.literal("root"),
    children: z.array(z.union([hastElement, hastText])),
  })
  .meta({
    id: "Hast",
    description:
      "Rich text as an HTML syntax tree (hast): elements and text, as the app renders them.",
  });
