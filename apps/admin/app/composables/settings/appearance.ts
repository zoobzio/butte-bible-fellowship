import type { AppearanceForm, AppearanceRecord } from "@bbf/schema/types";
import type { Ramp } from "@bbf/theme/seeds";
import type { FormOptions, InjectionKey } from "#imports";

import type {
  AppearanceEditor,
  AppearanceEditors,
  AppearanceSection,
  ThemeColor,
} from "~/types/settings";

import {
  APPEARANCE_MODIFIERS,
  APPEARANCE_RAMPS,
  appearanceForm,
  appearanceRecord,
} from "@bbf/schema";
import { manifest } from "@bbf/theme/manifest";
import { seeds } from "@bbf/theme/seeds";
import { toAppearanceBody, toAppearanceForm } from "@bbf/utils/vm";
import {
  computed,
  createError,
  inject,
  provide,
  ref,
  useNuxtApp,
} from "#imports";
import { APPEARANCE } from "~/composables/settings/routes";
import { useSiteEditor } from "~/composables/site/editor";

type Fields = FormOptions<AppearanceForm>["fields"];
type Key = keyof AppearanceForm;

/** The fields each section sets, by their keys. */
const KEYS: Record<AppearanceSection, readonly Key[]> = {
  palette: APPEARANCE_RAMPS,
  modifiers: APPEARANCE_MODIFIERS,
};

/** The page's forms, as the sections under it find them. */
const EDITORS: InjectionKey<AppearanceEditors> = Symbol("appearance");

/**
 * The form of one section of how the site looks over what its theme says:
 * the `palette`, a color for each ramp of the theme's palette, or the
 * `modifiers`, a context for each of the theme's modifiers. Every field
 * starts as the theme has it, and only what is changed from that is
 * written: a field put back to the theme's own follows the theme again.
 *
 * A color is a hex code, typed, or picked from `colors`, the theme's own:
 * the seed of each of its ramps, by the ramp's name. Saved, it is drawn
 * out into every shade of its ramp, as the theme's own colors are. A
 * modifier is one of the contexts the theme gives it, named as the theme
 * names them: what a visitor starts with until they choose their own.
 *
 * How the site looks is one row, written as a whole. A section writes its
 * own fields over the rest of the row as `latest` has it, the record as it
 * was last saved by any section, so a save changes that section and
 * nothing else. The record a save keeps is handed to `saved`.
 */
export const useAppearanceEditor = (
  record: AppearanceRecord,
  section: AppearanceSection,
  latest: () => AppearanceRecord = () => record,
  saved: (record: AppearanceRecord) => void = () => {},
): AppearanceEditor => {
  const { $t } = useNuxtApp();

  const names: Record<Ramp, string> = {
    primary: $t.admin.appearance.primary(),
    secondary: $t.admin.appearance.secondary(),
    tertiary: $t.admin.appearance.tertiary(),
    error: $t.admin.appearance.error(),
    success: $t.admin.appearance.success(),
    warning: $t.admin.appearance.warning(),
    neutral: $t.admin.appearance.neutral(),
    "neutral-variant": $t.admin.appearance.neutralVariant(),
  };

  const colors: ThemeColor[] = APPEARANCE_RAMPS.map((ramp) => ({
    ramp,
    name: names[ramp],
    hex: seeds[ramp],
  }));

  const ramps = (): Fields =>
    APPEARANCE_RAMPS.map((ramp) => ({
      type: "text",
      key: ramp,
      label: names[ramp],
      placeholder: seeds[ramp],
      required: true,
    }));

  /*
   * The modifiers in the theme's order, each as the theme describes it. A
   * field is typed by its own key; these are built for every key at once,
   * and the schema is what holds each to its own contexts.
   */
  const modifiers = (): Fields =>
    APPEARANCE_MODIFIERS.flatMap((modifier) => {
      const entry = manifest.find((candidate) => candidate.id === modifier);
      if (entry === undefined) return [];
      return [
        {
          type: "select",
          key: modifier,
          label: entry.name,
          hint: entry.description,
          required: true,
          placeholder: "",
          options: entry.contexts.map((context) => ({
            value: context.id,
            label: context.name,
          })),
        },
      ];
    }) as Fields;

  const sections = {
    palette: {
      title: $t.admin.appearance.palette(),
      hint: $t.admin.appearance.paletteHint(),
      fields: ramps,
    },
    modifiers: {
      title: $t.admin.appearance.modifiers(),
      hint: $t.admin.appearance.modifiersHint(),
      fields: modifiers,
    },
  };

  const { title, hint, fields } = sections[section];
  const keys = KEYS[section];

  /* The section's own fields as the form holds them, and no other's. */
  const own = (form: AppearanceForm): Partial<AppearanceForm> =>
    Object.fromEntries(keys.map((key) => [key, form[key]]));

  /* Each section's form has a store of its own: they share no fields. */
  const editor = useSiteEditor<AppearanceForm, AppearanceRecord>(record, {
    id: `appearance-${section}`,
    fields: fields(),
    schema: appearanceForm,
    endpoint: APPEARANCE,
    record: appearanceRecord,
    toForm: toAppearanceForm,
    toBody: (form) =>
      toAppearanceBody({ ...toAppearanceForm(latest()), ...own(form) }),
    saved,
  });

  const invalid = computed(() =>
    keys.some((key) => editor.form.field(key).error !== undefined),
  );

  return { ...editor, title, hint, colors, invalid };
};

/**
 * The appearance settings as their page holds them: the form of each
 * section, built here and kept for as long as the page is, so what is
 * changed in one stays as another is read. The pages under this one each
 * draw their own with `useAppearanceSection`.
 *
 * The bar at the foot of the page saves and resets them together. `dirty`
 * and `saving` hold while any section's does, and `errors` is what each
 * one's last save said went wrong. `save` writes every section with a
 * change, one after the other: the row is written as a whole, and each
 * write is laid over what the one before it kept.
 */
export const useAppearanceEditors = (
  record: AppearanceRecord,
): AppearanceEditors => {
  /* The row as it was last saved, by whichever section. */
  const latest = ref(record);

  const build = (section: AppearanceSection) =>
    useAppearanceEditor(
      record,
      section,
      () => latest.value,
      (saved) => {
        latest.value = saved;
      },
    );

  const sections = { palette: build("palette"), modifiers: build("modifiers") };
  const all = Object.values(sections);

  const dirty = computed(() => all.some((editor) => editor.dirty.value));
  /* A save under way holds the bar until the last section is written. */
  const busy = ref(false);

  const saving = computed(
    () => busy.value || all.some((editor) => editor.saving.value),
  );
  const errors = computed(() =>
    all.flatMap((editor) => editor.error.value ?? []),
  );

  const save = async () => {
    if (saving.value) return;
    busy.value = true;
    try {
      for (const editor of all) {
        if (editor.dirty.value) await editor.save();
      }
    } finally {
      busy.value = false;
    }
  };

  const reset = () => {
    if (saving.value) return;
    for (const editor of all) editor.reset();
  };

  const editors = { sections, dirty, saving, errors, save, reset };
  provide(EDITORS, editors);
  return editors;
};

/**
 * The form of one section of the appearance settings, for the page under
 * them that draws it: the page above's own, with whatever it holds.
 */
export const useAppearanceSection = (
  section: AppearanceSection,
): AppearanceEditor => {
  const editors = inject(EDITORS, null);

  if (editors === null) {
    throw createError({
      statusCode: 500,
      message: "A section of the appearance settings was drawn on its own",
    });
  }

  return editors.sections[section];
};
