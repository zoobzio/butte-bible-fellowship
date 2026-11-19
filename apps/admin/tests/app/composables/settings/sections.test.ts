import { describe, expect, it } from "vitest";
import { ref } from "vue";

import { setRoutePath } from "#imports";
import { useSections } from "~/composables/settings/sections";

/** A section's form, as far as the menu reads it. */
const editor = () => ({ dirty: ref(false), invalid: ref(false) });

const pages = () => {
  const palette = editor();
  const modifiers = editor();
  const sections = useSections(() => [
    {
      label: "Color palette",
      to: "/settings/appearance/palette",
      editor: palette,
    },
    {
      label: "Modifiers",
      to: "/settings/appearance/modifiers",
      editor: modifiers,
    },
  ]);
  return { palette, modifiers, sections };
};

describe("useSections", () => {
  it("lists the sections as given, the one being read marked, with nothing to say of any", () => {
    setRoutePath("/settings/appearance/modifiers");
    expect(pages().sections.value).toEqual([
      {
        label: "Color palette",
        to: "/settings/appearance/palette",
        current: false,
        unsaved: false,
        invalid: false,
      },
      {
        label: "Modifiers",
        to: "/settings/appearance/modifiers",
        current: true,
        unsaved: false,
        invalid: false,
      },
    ]);
  });

  it("marks no section on a page that is none of them", () => {
    setRoutePath("/settings/appearance");
    expect(pages().sections.value.map((section) => section.current)).toEqual([
      false,
      false,
    ]);
  });

  it("says a section is unsaved while its form holds a change, whether or not it is the one being read", () => {
    setRoutePath("/settings/appearance/palette");
    const { palette, modifiers, sections } = pages();
    const unsaved = () => sections.value.map((section) => section.unsaved);
    modifiers.dirty.value = true;
    expect(unsaved()).toEqual([false, true]);
    palette.dirty.value = true;
    expect(unsaved()).toEqual([true, true]);
    modifiers.dirty.value = false;
    expect(unsaved()).toEqual([true, false]);
  });

  it("says a section is invalid while its form is", () => {
    setRoutePath("/settings/appearance/modifiers");
    const { palette, sections } = pages();
    palette.invalid.value = true;
    expect(sections.value.map((section) => section.invalid)).toEqual([
      true,
      false,
    ]);
  });
});
