import type {
  Appearance,
  AppearanceInput,
  AppearanceRecord,
  AppearanceSeeds,
} from "@bbf/schema/types";

import { appearance, appearanceInput, appearanceSeeds } from "@bbf/schema";

import type { AppearanceRecordRow, AppearanceRow } from "../types";

/*
 * What was stored, read through the schema it was written by: nothing of
 * it when the theme has changed under it since, and it no longer fits.
 */
const seedsOf = (stored: unknown): AppearanceSeeds => {
  const read = appearanceSeeds.safeParse(stored);
  return read.success ? read.data : {};
};

const inputOf = (stored: unknown): AppearanceInput => {
  const read = appearanceInput.safeParse(stored);
  return read.success ? read.data : {};
};

/**
 * How the site looks as the admin reads it: the seeds and the modifiers
 * that are set. What no longer fits the theme reads as nothing set.
 */
export const toAppearanceRecord = (
  row: AppearanceRecordRow,
): AppearanceRecord => ({
  seeds: seedsOf(row.seeds),
  input: inputOf(row.input),
  updatedAt: row.updated_at.toISOString(),
});

/**
 * How the site looks as the site reads it: the patch and the modifiers as
 * they were stored. The site holds them to the theme it is built with
 * where it applies them.
 */
export const toAppearance = (row: AppearanceRow): Appearance => {
  const read = appearance.safeParse(row);
  return read.success ? read.data : { patch: {}, input: {} };
};
