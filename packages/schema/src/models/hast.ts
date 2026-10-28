import { z } from "zod";

const hastPropertyValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string(), z.number()])),
]);

export const hastText = z
  .object({
    type: z.literal("text"),
    value: z.string().meta({ examples: ["Has served since 2010."] }),
  })
  .meta({ id: "HastText", description: "A run of text." });

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
