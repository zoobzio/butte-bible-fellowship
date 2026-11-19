import type { AppUnthemeInput, AppUnthemePatch } from "#imports";
import type { SiteAppearance } from "#layers/bbf/app/types/theme";

import { accessUntheme, useState, useUntheme } from "#imports";
import { isModifier } from "@bbf/theme";
import { overlay } from "#layers/bbf/app/utils/theme";

/** How the site looks, as it is read: not yet held to the theme. */
export interface StoredAppearance {
  patch: unknown;
  input: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * How the site looks over what its theme says: what whoever runs the site
 * set without a deployment. The theme the app is built with holds the
 * defaults, and this is laid over them: the overrides of its tokens while
 * the site's own theme is the one applied, and the modifiers a visitor
 * starts with. A visitor's own choices win. One who has chosen a theme
 * keeps it, and one who has set a modifier keeps every modifier as they
 * left it.
 *
 * `adopt` takes what was read on the server, before the page renders, so
 * the first response already looks as it was set. What it adopts rides in
 * the payload, and `restore` lays the overrides back when a visitor comes
 * back to the site's own theme from another.
 */
export const useAppearance = () => {
  const untheme = useUntheme();
  const site = useState<SiteAppearance | null>("appearance", () => null);
  /*
   * The state and the cookies are taken here, with the app at hand:
   * `adopt` runs once what was stored has been read, and by then it is not.
   */
  const { config, cookies } = accessUntheme();

  /** Whether a patch is the site's own theme: the base, or its own layer. */
  const own = (patch: AppUnthemePatch) =>
    patch.id === undefined || patch.id === untheme.schema.base.id;

  /**
   * The overrides, held to the theme this app is built with: none of them
   * if any no longer fits, as after a build that renamed a token.
   */
  const patchOf = (stored: unknown): SiteAppearance["patch"] => {
    if (!untheme.schema.check.patch(stored)) return {};
    return {
      ...(stored.tokens === undefined ? {} : { tokens: stored.tokens }),
      ...(stored.modifiers === undefined
        ? {}
        : { modifiers: stored.modifiers }),
    };
  };

  /** The modifiers set, each held to the theme: one that no longer fits is dropped. */
  const inputOf = (stored: unknown): SiteAppearance["input"] => {
    if (!isRecord(stored)) return {};
    return Object.fromEntries(
      Object.entries(stored).filter(
        ([modifier, context]) =>
          isModifier(modifier) &&
          untheme.contexts(modifier).some((known) => known === context),
      ),
    );
  };

  /*
   * The state is written as it is, and not through the service: a write
   * through the service is a visitor's choice, which it keeps in their
   * cookies, and these are the site's defaults, which must stay out of
   * them to go on following what is set.
   */
  const adopt = (stored: StoredAppearance) => {
    const next: SiteAppearance = {
      patch: patchOf(stored.patch),
      input: inputOf(stored.input),
    };
    site.value = next;
    if (!cookies.input.value) {
      config.value.input = {
        ...config.value.input,
        ...next.input,
      } as AppUnthemeInput;
    }
    if (own(config.value.patch)) {
      config.value.patch = overlay(config.value.patch, next.patch);
    }
  };

  /**
   * Lays the overrides over the site's own theme once a visitor has put it
   * back in place of another. Nothing over any other theme, and nothing
   * where nothing was set.
   */
  const restore = () => {
    const patch = site.value?.patch;
    if (patch === undefined || !own(untheme.config.patch)) return;
    if (patch.tokens === undefined && patch.modifiers === undefined) return;
    untheme.update(patch);
  };

  return { site, adopt, restore };
};
