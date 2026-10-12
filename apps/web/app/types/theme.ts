import type { AppUnthemeInput } from "#imports";
import type { Modifier } from "@bbf/theme";
import type { LayerEntry, LayerId } from "@bbf/theme/layers";
import type { ModifierEntry } from "@bbf/theme/manifest";

export type ColorMode = AppUnthemeInput["color"];

/** A theme: the site's palette, or one of aurora's, each a layer of the build. */
export type Theme = LayerId;

/** A theme as the picker lists it. */
export type ThemeEntry = LayerEntry;

/** A modifier the picker offers as a button group. */
export type Setting = Modifier;

/** A setting as the picker lists it, with the contexts it switches between. */
export type SettingEntry = ModifierEntry<Setting>;
