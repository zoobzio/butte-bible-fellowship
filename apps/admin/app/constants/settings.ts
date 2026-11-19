/** The tabs of the settings page, each a page under it. */
export const TABS = {
  appearance: "/settings/appearance",
} as const;

/**
 * The sections of the appearance settings, each a page under their tab with
 * a form of its own: a new one is a page added there and an address here.
 */
export const APPEARANCE_SECTIONS = {
  palette: `${TABS.appearance}/palette`,
  modifiers: `${TABS.appearance}/modifiers`,
} as const;
