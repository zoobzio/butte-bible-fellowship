import type {
  AppearanceBody,
  AppearanceForm,
  AppearanceRecord,
} from "@bbf/schema/types";

import { APPEARANCE_MODIFIERS, APPEARANCE_RAMPS } from "@bbf/schema";
import { input } from "@bbf/theme/config";
import { seeds } from "@bbf/theme/seeds";

/** The form with nothing set: every ramp and every modifier as the theme has it. */
const DEFAULTS: AppearanceForm = { ...seeds, ...input };

/** What of a record is set: a member left out says nothing. */
const set = <T extends object>(values: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined),
  ) as Partial<T>;

/**
 * The record as the form holds it: a color for every ramp and a context
 * for every modifier, the theme's own wherever the record sets none.
 */
export const toAppearanceForm = (record: AppearanceRecord): AppearanceForm => ({
  ...DEFAULTS,
  ...set(record.seeds),
  ...set(record.input),
});

/**
 * The form as it is written: only what differs from the theme. A ramp or a
 * modifier put back to the theme's own is left out, and so follows the
 * theme again, whatever a later build makes of it.
 */
export const toAppearanceBody = (form: AppearanceForm): AppearanceBody => ({
  seeds: Object.fromEntries(
    APPEARANCE_RAMPS.filter(
      (ramp) => form[ramp].toLowerCase() !== DEFAULTS[ramp],
    ).map((ramp) => [ramp, form[ramp].toLowerCase()]),
  ),
  input: Object.fromEntries(
    APPEARANCE_MODIFIERS.filter(
      (modifier) => form[modifier] !== DEFAULTS[modifier],
    ).map((modifier) => [modifier, form[modifier]]),
  ),
});
