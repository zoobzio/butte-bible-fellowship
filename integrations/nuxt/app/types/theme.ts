import type { AppUnthemeInput } from "#imports";
import type { Modifier } from "@bbf/theme";
import type { LayerEntry, LayerId } from "@bbf/theme/layers";
import type { ModifierEntry } from "@bbf/theme/manifest";

export type ColorMode = AppUnthemeInput["color"];

/** The accessible name of the color scheme toggle, by the scheme it switches to. */
export type ColorModeLabels = Record<ColorMode, string>;

/** A theme: the site's palette, or one of aurora's, each a layer of the build. */
export type Theme = LayerId;

/** A theme as the picker lists it. */
export type ThemeEntry = LayerEntry;

/** The names the theme picker shows: its button, its list, and its search field. */
export interface ThemePickerLabels {
  open: string;
  themes: string;
  search: string;
}

/** A modifier the settings offer as a button group. */
export type Setting = Modifier;

/** A setting as the settings list it, with the contexts it switches between. */
export type SettingEntry = ModifierEntry<Setting>;
