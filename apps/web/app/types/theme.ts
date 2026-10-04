import type { AppUnthemeInput } from "#imports";

export type ColorMode = AppUnthemeInput["color"];

export type Theme = AppUnthemeInput["theme"];

/** A theme as the picker lists it. */
export interface ThemeEntry {
  id: Theme;
  name: string;
  description?: string;
}
