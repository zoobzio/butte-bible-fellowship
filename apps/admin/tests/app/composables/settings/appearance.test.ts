import type { AppearanceRecord } from "@bbf/schema/types";

import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";

import { input } from "@bbf/theme/config";
import { seeds } from "@bbf/theme/seeds";
import { APPEARANCE, APPEARANCE_SET } from "#test/support/records";
import {
  useAppearanceEditor,
  useAppearanceEditors,
  useAppearanceSection,
} from "~/composables/settings/appearance";

const DEFAULTS = { ...seeds, ...input };

describe("useAppearanceEditor", () => {
  it("is the form of one section: a color for each ramp of the palette, or a context for each modifier", () => {
    const palette = useAppearanceEditor(APPEARANCE, "palette");
    expect(palette.form.id).toBe("appearance-palette");
    expect(
      palette.form.config.fields.map((field) => [field.key, field.type]),
    ).toEqual([
      ["primary", "text"],
      ["secondary", "text"],
      ["tertiary", "text"],
      ["error", "text"],
      ["success", "text"],
      ["warning", "text"],
      ["neutral", "text"],
      ["neutral-variant", "text"],
    ]);
    const modifiers = useAppearanceEditor(APPEARANCE, "modifiers");
    expect(modifiers.form.id).toBe("appearance-modifiers");
    expect(
      modifiers.form.config.fields.map((field) => [field.key, field.type]),
    ).toEqual([
      ["color", "select"],
      ["vibrancy", "select"],
      ["contrast", "select"],
      ["text", "select"],
      ["density", "select"],
      ["radius", "select"],
      ["depth", "select"],
      ["motion", "select"],
    ]);
  });

  it("starts every field as the theme has it, where nothing is set", () => {
    expect(useAppearanceEditor(APPEARANCE, "palette").form.payload).toEqual(
      DEFAULTS,
    );
  });

  it("starts a field that is set as it was set, and holds the other section's as the record has them", () => {
    const set = { ...DEFAULTS, primary: "#7c3aed", color: "dark", text: "lg" };
    expect(useAppearanceEditor(APPEARANCE_SET, "palette").form.payload).toEqual(
      set,
    );
    expect(
      useAppearanceEditor(APPEARANCE_SET, "modifiers").form.payload,
    ).toEqual(set);
  });

  it("names each color for the reader, and each modifier as the theme names it, with what the theme says of it", () => {
    const palette = useAppearanceEditor(APPEARANCE, "palette").form.config;
    expect(palette.fields.map((field) => field.label)).toEqual([
      "Primary",
      "Secondary",
      "Tertiary",
      "Error",
      "Success",
      "Warning",
      "Neutral",
      "Neutral variant",
    ]);
    expect(palette.fields.filter((field) => field.hint)).toEqual([]);
    const modifiers = useAppearanceEditor(APPEARANCE, "modifiers").form.config;
    expect(modifiers.fields.map((field) => field.label)).toEqual([
      "Color scheme",
      "Vibrancy",
      "Contrast",
      "Text size",
      "Density",
      "Corner radius",
      "Depth",
      "Motion",
    ]);
    expect(modifiers.fields.filter((field) => field.hint)).toHaveLength(8);
  });

  it("offers each modifier the contexts the theme gives it, by name", () => {
    const { fields } = useAppearanceEditor(APPEARANCE, "modifiers").form.config;
    const text = fields.find((field) => field.key === "text");
    expect(text).toMatchObject({
      options: [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
    });
  });

  it("offers the theme's own colors to pick from: the seed of each ramp, by the ramp's name", () => {
    expect(useAppearanceEditor(APPEARANCE, "palette").colors).toEqual([
      { ramp: "primary", name: "Primary", hex: "#0a68ff" },
      { ramp: "secondary", name: "Secondary", hex: "#ff9a5c" },
      { ramp: "tertiary", name: "Tertiary", hex: "#ffde59" },
      { ramp: "error", name: "Error", hex: "#dc4a5e" },
      { ramp: "success", name: "Success", hex: "#57a53c" },
      { ramp: "warning", name: "Warning", hex: "#c08a1f" },
      { ramp: "neutral", name: "Neutral", hex: "#7e7871" },
      { ramp: "neutral-variant", name: "Neutral variant", hex: "#85776d" },
    ]);
  });

  it("heads each section with its name and what it sets", () => {
    expect(useAppearanceEditor(APPEARANCE, "palette")).toMatchObject({
      title: "Color palette",
      hint: "Pick a theme color or enter a hex code. Shades are generated automatically.",
    });
    expect(useAppearanceEditor(APPEARANCE, "modifiers")).toMatchObject({
      title: "Modifiers",
      hint: "Default settings for visitors, which they can change for themselves.",
    });
  });

  it("writes only what differs from the theme, and stays on what was kept", async () => {
    const fetch = vi.fn(async () => APPEARANCE_SET);
    vi.stubGlobal("$fetch", fetch);
    const editor = useAppearanceEditor(APPEARANCE, "palette");
    editor.form.set("primary", " #7C3AED ");
    expect(editor.dirty.value).toBe(true);
    await editor.save();
    expect(fetch).toHaveBeenCalledExactlyOnceWith("/api/settings/appearance", {
      method: "PUT",
      body: { seeds: { primary: "#7c3aed" }, input: {} },
    });
    expect(editor.form.payload.primary).toBe("#7c3aed");
    expect(editor.dirty.value).toBe(false);
  });

  it("changes its own section and writes the other as it was last saved, whatever its form holds", async () => {
    const latest = {
      ...APPEARANCE_SET,
      input: { color: "dark" as const, text: "sm" as const },
    };
    const fetch = vi.fn(async () => latest);
    vi.stubGlobal("$fetch", fetch);
    const palette = useAppearanceEditor(
      APPEARANCE_SET,
      "palette",
      () => latest,
    );
    palette.form.set("secondary", "#0ea5e9");
    expect(palette.form.payload.text).toBe("lg");
    await palette.save();
    expect(fetch).toHaveBeenLastCalledWith("/api/settings/appearance", {
      method: "PUT",
      body: {
        seeds: { primary: "#7c3aed", secondary: "#0ea5e9" },
        input: { color: "dark", text: "sm" },
      },
    });
  });

  it("says a save found something wrong in it, until that is put right or put back", async () => {
    const editor = useAppearanceEditor(APPEARANCE, "palette");
    expect(editor.invalid.value).toBe(false);
    editor.form.set("primary", "purple");
    await editor.save();
    expect(editor.invalid.value).toBe(true);
    editor.reset();
    expect(editor.invalid.value).toBe(false);
  });

  it("hands the record a save keeps to the page that holds it, and nothing until then", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => APPEARANCE_SET),
    );
    const saved = vi.fn();
    const editor = useAppearanceEditor(
      APPEARANCE,
      "palette",
      () => APPEARANCE,
      saved,
    );
    editor.form.set("primary", "#7c3aed");
    expect(saved).not.toHaveBeenCalled();
    await editor.save();
    expect(saved).toHaveBeenCalledExactlyOnceWith(APPEARANCE_SET);
  });

  it("writes nothing of a field put back to the theme's own", async () => {
    const fetch = vi.fn(async () => APPEARANCE);
    vi.stubGlobal("$fetch", fetch);
    const editor = useAppearanceEditor(APPEARANCE_SET, "palette");
    editor.form.set("primary", seeds.primary);
    await editor.save();
    expect(fetch).toHaveBeenCalledWith("/api/settings/appearance", {
      method: "PUT",
      body: { seeds: {}, input: { color: "dark", text: "lg" } },
    });
    expect(editor.form.payload).toEqual(DEFAULTS);
  });

  it("keeps the form open on what is no color, and says what a color is", async () => {
    const fetch = vi.fn(async () => APPEARANCE);
    vi.stubGlobal("$fetch", fetch);
    const saved = vi.fn();
    const editor = useAppearanceEditor(
      APPEARANCE,
      "palette",
      () => APPEARANCE,
      saved,
    );
    editor.form.set("primary", "purple");
    await editor.save();
    expect(fetch).not.toHaveBeenCalled();
    expect(saved).not.toHaveBeenCalled();
    expect(editor.form.field("primary").error).toBe(
      "A color as a hex code, such as #0a68ff.",
    );
    expect(editor.error.value).toBeNull();
  });

  it("puts back what was last saved", () => {
    const editor = useAppearanceEditor(APPEARANCE_SET, "palette");
    editor.form.set("primary", "#000000");
    editor.reset();
    expect(editor.form.payload.primary).toBe("#7c3aed");
    expect(editor.dirty.value).toBe(false);
  });
});

/** The appearance tab's forms, with a section drawn under the page that holds them. */
const mountEditors = (record: AppearanceRecord = APPEARANCE) => {
  let editors!: ReturnType<typeof useAppearanceEditors>;
  let section!: ReturnType<typeof useAppearanceSection>;
  const Section = defineComponent({
    setup() {
      section = useAppearanceSection("modifiers");
      return () => h("div");
    },
  });
  mount(
    defineComponent({
      setup() {
        editors = useAppearanceEditors(record);
        return () => h(Section);
      },
    }),
  );
  return { editors, section };
};

describe("useAppearanceEditors", () => {
  it("holds a form for each section, each its own, and hands a section's page its own", () => {
    const { editors, section } = mountEditors();
    expect(editors.sections.palette.form.id).toBe("appearance-palette");
    expect(editors.sections.modifiers.form.id).toBe("appearance-modifiers");
    expect(section).toBe(editors.sections.modifiers);
  });

  it("has nothing to save until a section is changed, and then while any is", () => {
    const { editors } = mountEditors();
    expect(editors.dirty.value).toBe(false);
    editors.sections.modifiers.form.set("text", "lg");
    expect(editors.dirty.value).toBe(true);
    expect(editors.sections.palette.dirty.value).toBe(false);
  });

  it("saves every section with a change, one after the other, each over what the last kept", async () => {
    const kept = [
      { ...APPEARANCE, seeds: { primary: "#7c3aed" } },
      { ...APPEARANCE, seeds: { primary: "#7c3aed" }, input: { text: "lg" } },
    ];
    const fetch = vi.fn(async () => kept.shift());
    vi.stubGlobal("$fetch", fetch);
    const { editors } = mountEditors();
    editors.sections.palette.form.set("primary", "#7c3aed");
    editors.sections.modifiers.form.set("text", "lg");
    const saving = editors.save();
    expect(editors.saving.value).toBe(true);
    await saving;
    expect(fetch.mock.calls).toEqual([
      [
        "/api/settings/appearance",
        { method: "PUT", body: { seeds: { primary: "#7c3aed" }, input: {} } },
      ],
      [
        "/api/settings/appearance",
        {
          method: "PUT",
          body: { seeds: { primary: "#7c3aed" }, input: { text: "lg" } },
        },
      ],
    ]);
    expect(editors.dirty.value).toBe(false);
    expect(editors.saving.value).toBe(false);
  });

  it("leaves a section without a change alone", async () => {
    const fetch = vi.fn(async () => APPEARANCE_SET);
    vi.stubGlobal("$fetch", fetch);
    const { editors } = mountEditors(APPEARANCE_SET);
    editors.sections.modifiers.form.set("text", "sm");
    await editors.save();
    expect(fetch).toHaveBeenCalledExactlyOnceWith("/api/settings/appearance", {
      method: "PUT",
      body: {
        seeds: { primary: "#7c3aed" },
        input: { color: "dark", text: "sm" },
      },
    });
  });

  it("says what each section's save said went wrong", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("down");
      }),
    );
    const { editors } = mountEditors();
    editors.sections.palette.form.set("primary", "#7c3aed");
    await editors.save();
    expect(editors.errors.value).toHaveLength(1);
    expect(editors.dirty.value).toBe(true);
  });

  it("puts every section back as it was last saved", () => {
    const { editors } = mountEditors(APPEARANCE_SET);
    editors.sections.palette.form.set("primary", "#000000");
    editors.sections.modifiers.form.set("text", "sm");
    editors.reset();
    expect(editors.sections.palette.form.payload.primary).toBe("#7c3aed");
    expect(editors.sections.modifiers.form.payload.text).toBe("lg");
    expect(editors.dirty.value).toBe(false);
  });
});

describe("useAppearanceSection", () => {
  it("is no use on its own, without the page that holds the forms", () => {
    let error: unknown;
    mount(
      defineComponent({
        setup() {
          try {
            useAppearanceSection("palette");
          } catch (caught) {
            error = caught;
          }
          return () => h("div");
        },
      }),
    );
    expect(error).toMatchObject({
      statusCode: 500,
      message: "A section of the appearance settings was drawn on its own",
    });
  });
});
