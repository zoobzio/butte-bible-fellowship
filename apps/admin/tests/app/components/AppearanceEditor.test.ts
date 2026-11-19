import type { AppearanceRecord } from "@bbf/schema/types";

import type { AppearanceSection } from "~/types/settings";

import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";

import { APPEARANCE, APPEARANCE_SET } from "#test/support/records";
import AppearanceEditor from "~/components/AppearanceEditor.vue";
import { useAppearanceEditor } from "~/composables/settings/appearance";

/** The panel as a section of the appearance tab draws it, over its own form. */
const mountPanel = (
  record: AppearanceRecord = APPEARANCE,
  section: AppearanceSection = "palette",
) => {
  let editor!: ReturnType<typeof useAppearanceEditor>;
  const wrapper = mount(
    defineComponent({
      setup() {
        editor = useAppearanceEditor(record, section);
        return () => h(AppearanceEditor, { editor });
      },
    }),
    { attachTo: document.body },
  );
  return { wrapper, editor };
};

const value = (wrapper: ReturnType<typeof mount>, id: string) =>
  (wrapper.find(`#${id}`).element as HTMLInputElement).value;

const field = (wrapper: ReturnType<typeof mount>, id: string) =>
  wrapper
    .findAll(".f-data-form-field")
    .find((candidate) => candidate.find(`#${id}`).exists())!;

describe("AppearanceEditor", () => {
  it("draws a field for every color of the palette, each labelled", () => {
    const { wrapper } = mountPanel();
    expect(
      wrapper.findAll(".f-data-form-field-label").map((label) => label.text()),
    ).toEqual([
      "Primary",
      "Secondary",
      "Tertiary",
      "Error",
      "Success",
      "Warning",
      "Neutral",
      "Neutral variant",
    ]);
    const label = field(wrapper, "appearance-palette-primary").find("label");
    expect(label.attributes("for")).toBe("appearance-palette-primary");
  });

  it("draws a field for every modifier, each labelled, and none for a color", () => {
    const { wrapper } = mountPanel(APPEARANCE, "modifiers");
    expect(
      wrapper.findAll(".f-data-form-field-label").map((label) => label.text()),
    ).toEqual([
      "Color scheme",
      "Vibrancy",
      "Contrast",
      "Text size",
      "Density",
      "Corner radius",
      "Depth",
      "Motion",
    ]);
    expect(wrapper.find("#appearance-modifiers-color").exists()).toBe(true);
    // A modifier is picked from a list, and has no colors under it.
    expect(wrapper.find(".appearance-editor-colors").exists()).toBe(false);
  });

  it("heads its section once, over the form, with what the section sets", () => {
    const palette = mountPanel().wrapper;
    expect(
      palette
        .findAll("h2.appearance-editor-title")
        .map((title) => title.text()),
    ).toEqual(["Color palette"]);
    expect(palette.find(".appearance-editor-hint").text()).toContain(
      "type a hex code",
    );
    expect(
      palette
        .find(".appearance-editor > .appearance-editor-group + form")
        .exists(),
    ).toBe(true);
    const modifiers = mountPanel(APPEARANCE, "modifiers").wrapper;
    expect(
      modifiers
        .findAll("h2.appearance-editor-title")
        .map((title) => title.text()),
    ).toEqual(["Modifiers"]);
    expect(modifiers.find(".appearance-editor-hint").text()).toBe(
      "What a visitor starts with, until they choose their own.",
    );
  });

  it("fills each color with the theme's own until one is set, and shows the color beside its code", () => {
    const { wrapper } = mountPanel(APPEARANCE_SET);
    expect(value(wrapper, "appearance-palette-primary")).toBe("#7c3aed");
    expect(value(wrapper, "appearance-palette-secondary")).toBe("#ff9a5c");
    const shown = field(wrapper, "appearance-palette-primary").find(
      ".appearance-editor-shown",
    );
    expect(shown.attributes("aria-hidden")).toBe("true");
    expect((shown.element as HTMLElement).style.background).toBe("#7c3aed");
  });

  it("offers the theme's own colors under every color field, each a button named for the color", () => {
    const { wrapper } = mountPanel();
    const colors = field(wrapper, "appearance-palette-tertiary").find(
      ".appearance-editor-colors",
    );
    expect(colors.attributes()).toMatchObject({
      role: "group",
      "aria-label": "Theme colors",
    });
    expect(
      colors
        .findAll("button.appearance-editor-pick")
        .map((pick) => [
          pick.attributes("type"),
          pick.attributes("aria-label"),
        ]),
    ).toEqual([
      ["button", "Primary: #0a68ff"],
      ["button", "Secondary: #ff9a5c"],
      ["button", "Tertiary: #ffde59"],
      ["button", "Error: #dc4a5e"],
      ["button", "Success: #57a53c"],
      ["button", "Warning: #c08a1f"],
      ["button", "Neutral: #7e7871"],
      ["button", "Neutral variant: #85776d"],
    ]);
    expect(wrapper.findAll(".appearance-editor-colors")).toHaveLength(8);
  });

  it("marks the color a field is set to among the theme's, whatever its case", async () => {
    const { wrapper, editor } = mountPanel();
    const pressed = () =>
      field(wrapper, "appearance-palette-primary")
        .findAll(".appearance-editor-pick")
        .filter((pick) => pick.attributes("aria-pressed") === "true")
        .map((pick) => pick.attributes("aria-label"));
    expect(pressed()).toEqual(["Primary: #0a68ff"]);
    editor.form.set("primary", "#FF9A5C");
    await wrapper.vm.$nextTick();
    expect(pressed()).toEqual(["Secondary: #ff9a5c"]);
    editor.form.set("primary", "#7c3aed");
    await wrapper.vm.$nextTick();
    expect(pressed()).toEqual([]);
  });

  it("sets a field to one of the theme's colors when it is picked, which is a change to save", async () => {
    const { wrapper, editor } = mountPanel();
    expect(editor.dirty.value).toBe(false);
    await field(wrapper, "appearance-palette-primary")
      .findAll(".appearance-editor-pick")[1]!
      .trigger("click");
    expect(editor.form.payload.primary).toBe("#ff9a5c");
    expect(value(wrapper, "appearance-palette-primary")).toBe("#ff9a5c");
    expect(editor.form.payload.secondary).toBe("#ff9a5c");
    expect(editor.dirty.value).toBe(true);
  });

  it("takes a hex code as it is typed, and shows no color until it is one", async () => {
    const { wrapper, editor } = mountPanel();
    const shown = () =>
      (
        field(wrapper, "appearance-palette-primary").find(
          ".appearance-editor-shown",
        ).element as HTMLElement
      ).style.background;
    await wrapper.find("#appearance-palette-primary").setValue("#7c3");
    expect(editor.form.payload.primary).toBe("#7c3");
    expect(shown()).toBe("");
    await wrapper.find("#appearance-palette-primary").setValue("#7c3aed");
    expect(shown()).toBe("#7c3aed");
  });

  it("keeps no button of its own: the page's bar saves it", () => {
    const { wrapper } = mountPanel();
    expect(wrapper.find(".f-data-form-submit").exists()).toBe(false);
    expect(wrapper.find(".f-data-form-reset").exists()).toBe(false);
    expect(wrapper.find("form").attributes("novalidate")).toBeDefined();
  });
});
