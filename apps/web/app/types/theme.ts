import type { AppUnthemeInput } from "#imports";
import type { Modifier } from "@bbf/theme";
import type { ModifierEntry } from "@bbf/theme/manifest";

export type ColorMode = AppUnthemeInput["color"];

export type Theme = AppUnthemeInput["theme"];

/** A theme as the picker lists it. */
export interface ThemeEntry {
  id: Theme;
  name: string;
  description?: string;
}

/** A modifier the picker offers as a button group: every one but `theme`. */
export type Setting = Exclude<Modifier, "theme">;

/** A setting as the picker lists it, with the contexts it switches between. */
export type SettingEntry = ModifierEntry<Setting>;
