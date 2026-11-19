// @ts-expect-error: aurora ships its ramp generator as plain JavaScript, with no types of its own.
import { ramp as generate } from "@untheme/aurora/ramp";

/** A color as the generator writes it: sRGB channels and their hex. */
export interface RampColor {
  colorSpace: "srgb";
  components: [number, number, number];
  hex: string;
}

/**
 * Aurora's ramp generator, the one the theme's own palette is made with,
 * typed as it reads: the tokens of one ramp, drawn from one seed. Eleven
 * stops, and for an accent the muted and the vivid columns beside them,
 * each by its name.
 */
export const ramp: (
  name: string,
  seed: string,
) => Record<string, { $type: "color"; $value: RampColor }> = generate;
