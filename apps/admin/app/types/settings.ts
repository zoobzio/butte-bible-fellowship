import type { AppearanceForm } from "@bbf/schema/types";
import type { Ramp } from "@bbf/theme/seeds";
import type { Ref } from "#imports";

import type { Metadata } from "~/types/editor";
import type { PageLink } from "~/types/navigation";

/**
 * One of the theme's own colors, as a color field offers it: the ramp it
 * is the theme's color of, what that is called, and its hex code.
 */
export interface ThemeColor {
  ramp: Ramp;
  name: string;
  hex: string;
}

/**
 * A section of the appearance settings, each with a form of its own: the
 * colors of the theme's palette, or what a visitor starts with for each of
 * the theme's modifiers.
 */
export type AppearanceSection = "palette" | "modifiers";

/**
 * The form of one section of how the site looks, as the panel that draws
 * it takes it: the form and what the bar that saves the settings reads of
 * it, the heading over it and the line under the heading, the theme's own
 * colors any color field may be set to, and whether a save has found
 * something wrong in one of its fields.
 */
export interface AppearanceEditor extends Metadata<AppearanceForm> {
  title: string;
  hint: string;
  colors: ThemeColor[];
  invalid: Readonly<Ref<boolean>>;
}

/**
 * The appearance settings as their page holds them: the form of each
 * section, each its own, and the whole of them for the bar that saves and
 * resets them together.
 */
export interface AppearanceEditors {
  sections: Record<AppearanceSection, AppearanceEditor>;
  dirty: Readonly<Ref<boolean>>;
  saving: Readonly<Ref<boolean>>;
  errors: Readonly<Ref<string[]>>;
  save: () => Promise<void>;
  reset: () => void;
}

/**
 * A section of a page of settings, as the menu beside them lists it: a
 * link to its page, whether that is the page being read, whether it holds
 * changes that are not saved, and whether a save found something wrong in
 * it.
 */
export interface Section extends PageLink {
  current: boolean;
  unsaved: boolean;
  invalid: boolean;
}
