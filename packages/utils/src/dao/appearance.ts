import type { AppearanceBody, AppearanceSeeds } from "@bbf/schema/types";

import type { RampColor } from "../ramp";
import type { AppearanceArguments } from "../types";

import { ramp } from "../ramp";

/** The overrides of the theme's tokens the seeds come to: a patch of the theme. */
export interface SeedPatch {
  tokens: Record<string, RampColor>;
}

/**
 * The seeds as the theme's runtime takes them: each ramp that is set,
 * drawn out from its seed into every stop of the ramp by the generator the
 * theme's own palette is made with, as overrides of those tokens. A ramp
 * with no seed is left to the theme, and so is every role: each reads a
 * stop of a ramp, and follows it.
 */
export const toSeedPatch = (seeds: AppearanceSeeds): SeedPatch => {
  const tokens: SeedPatch["tokens"] = {};
  for (const [name, seed] of Object.entries(seeds)) {
    if (seed === undefined) continue;
    for (const [token, slot] of Object.entries(ramp(name, seed))) {
      tokens[token] = slot.$value;
    }
  }
  return { tokens };
};

/**
 * How the site looks as its row is written: the seeds and the modifiers as
 * the admin set them, and the patch the seeds come to, which is what the
 * site applies.
 */
export const toAppearanceArguments = (
  body: AppearanceBody,
): AppearanceArguments => ({
  seeds: body.seeds,
  patch: toSeedPatch(body.seeds),
  input: body.input,
});
