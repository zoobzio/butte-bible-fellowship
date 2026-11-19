import type { Context, Modifier } from "@bbf/theme";
import type { Ramp } from "@bbf/theme/seeds";

import { z } from "zod";

import {
  APPEARANCE_MODIFIERS,
  APPEARANCE_RAMPS,
  SEED_ERROR,
  SEED_PATTERN,
  appearanceInput,
  appearanceSeeds,
  context,
} from "../models/appearance";

export const appearanceBody = z
  .object({
    seeds: appearanceSeeds,
    input: appearanceInput,
  })
  .meta({
    id: "AppearanceBody",
    description:
      "How the site looks as it is written: the color of each ramp set, and the context of each modifier set. Whatever is left out goes back to what the theme says.",
  });

/** A seed as it is typed: any case, and whatever space is around it. */
const typed = z
  .string()
  .trim()
  .regex(SEED_PATTERN, { error: SEED_ERROR })
  .toLowerCase();

type Fields = { [R in Ramp]: typeof typed } & {
  [M in Modifier]: z.ZodType<Context<M>>;
};

export const appearanceForm = z
  .object({
    ...Object.fromEntries(APPEARANCE_RAMPS.map((ramp) => [ramp, typed])),
    ...Object.fromEntries(
      APPEARANCE_MODIFIERS.map((modifier) => [modifier, context(modifier)]),
    ),
  } as unknown as Fields)
  .meta({
    description:
      "How the site looks as the admin's form holds it: a color for every ramp and a context for every modifier, each the theme's own until it is changed.",
  });
