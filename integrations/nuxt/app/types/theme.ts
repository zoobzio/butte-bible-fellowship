import type { AppUnthemeInput } from "#imports";
import type { Modifier } from "@bbf/theme";
import type { LayerEntry, LayerId } from "@bbf/theme/layers";
import type { ModifierEntry } from "@bbf/theme/manifest";

export type ColorMode = AppUnthemeInput["color"];

export type Theme = LayerId;

export type ThemeEntry = LayerEntry;

export type Setting = Modifier;

export type SettingEntry = ModifierEntry<Setting>;
