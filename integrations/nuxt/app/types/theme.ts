import type { AppUnthemeInput, AppUnthemePatch } from "#imports";
import type { Modifier } from "@bbf/theme";
import type { LayerEntry, LayerId } from "@bbf/theme/layers";
import type { ModifierEntry } from "@bbf/theme/manifest";

export type ColorMode = AppUnthemeInput["color"];

export type Theme = LayerId;

export type ThemeEntry = LayerEntry;

export type Setting = Modifier;

export type SettingEntry = ModifierEntry<Setting>;

/**
 * How the site looks over what its theme says, as whoever runs the site
 * set it: the overrides of the theme's tokens, which hold while the site's
 * own theme is the one applied, and the context of each modifier a visitor
 * starts with, for each one set, until they choose their own.
 */
export interface SiteAppearance {
  patch: Pick<AppUnthemePatch, "tokens" | "modifiers">;
  input: Partial<AppUnthemeInput>;
}
