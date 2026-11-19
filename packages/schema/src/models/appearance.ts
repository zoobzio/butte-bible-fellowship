import type { Context, Modifier } from "@bbf/theme";
import type { Ramp } from "@bbf/theme/seeds";

import { modifiers } from "@bbf/theme";
import { seeds } from "@bbf/theme/seeds";
import { z } from "zod";

/**
 * The ramps of the theme's palette, each by its name: what the admin sets
 * a color for. They are the theme's own, in the order it seeds them.
 */
export const APPEARANCE_RAMPS = Object.keys(seeds) as Ramp[];

/**
 * The modifiers of the theme, each by its name: the color scheme, the
 * contrast, the text size and the rest. They are the theme's own, in the
 * order it composes them.
 */
export const APPEARANCE_MODIFIERS = Object.keys(modifiers) as Modifier[];

/** What a seed has to be: a color as six hex digits after a `#`. */
export const SEED_PATTERN = /^#[0-9a-f]{6}$/i;

export const SEED_ERROR = "A color as a hex code, such as #0a68ff.";

/**
 * A seed: the one color a ramp of the palette is drawn from, which gives
 * the ramp its hue and its chroma. Kept in lowercase, however it is typed.
 */
export const seed = z
  .string()
  .regex(SEED_PATTERN, { error: SEED_ERROR })
  .toLowerCase()
  .meta({
    description:
      "A color as a hex code: the one color a ramp of the palette is drawn from.",
    examples: ["#0a68ff"],
  });

/** A context of one modifier, of the ones the theme gives it. */
export const context = <M extends Modifier>(modifier: M) =>
  z.enum(modifiers[modifier] as readonly Context<M>[]) as unknown as z.ZodType<
    Context<M>
  >;

type Seeds = { [R in Ramp]: z.ZodOptional<typeof seed> };

type Contexts = { [M in Modifier]: z.ZodOptional<z.ZodType<Context<M>>> };

export const appearanceSeeds = z
  .object(
    Object.fromEntries(
      APPEARANCE_RAMPS.map((ramp) => [ramp, seed.optional()]),
    ) as Seeds,
  )
  .meta({
    id: "AppearanceSeeds",
    description:
      "The color each ramp of the palette is set to, by the ramp's name. A ramp left out keeps the color the theme gives it.",
    examples: [{ primary: "#0a68ff" }],
  });

export const appearanceInput = z
  .object(
    Object.fromEntries(
      APPEARANCE_MODIFIERS.map((modifier) => [
        modifier,
        context(modifier).optional(),
      ]),
    ) as unknown as Contexts,
  )
  .meta({
    id: "AppearanceInput",
    description:
      "The context of each modifier a visitor starts with, by the modifier's name, until they choose their own. A modifier left out starts where the theme puts it.",
    examples: [{ color: "dark", text: "lg" }],
  });

export const appearanceRecord = z
  .object({
    seeds: appearanceSeeds,
    input: appearanceInput,
    updatedAt: z.iso.datetime().meta({
      description: "When how the site looks was last changed.",
      examples: ["2026-11-19T18:00:00.000Z"],
    }),
  })
  .meta({
    id: "AppearanceRecord",
    description:
      "How the site looks over what its theme says, as the admin reads it: the color each ramp is set to and the modifiers a visitor starts with.",
  });

export const appearance = z
  .object({
    patch: z.record(z.string(), z.unknown()).meta({
      description:
        "The overrides of the theme's tokens, as the theme's runtime takes a patch. It was made from the seeds when they were saved, and is not held to the theme here: the site checks it against the theme it is built with before it applies it, and sets aside one that no longer fits.",
    }),
    input: z.record(z.string(), z.unknown()).meta({
      description:
        "The context of each modifier a visitor starts with, by the modifier's name. Checked against the theme where it is applied, as the patch is.",
    }),
  })
  .meta({
    id: "Appearance",
    description:
      "How the site looks over what its theme says, as the site reads it: what it applies while its own theme is the one applied, for a visitor who has not chosen their own.",
  });
