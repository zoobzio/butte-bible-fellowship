import { describe, expect, it, vi } from "vitest";

import { ABOUT_PAGE } from "#test/support/records";
import { useAboutEditor } from "~/composables/site/about";

const FILLED = { title: "About Us", description: "A clean canvas." };

describe("useAboutEditor", () => {
  it("is the about form, on the page's metadata: its title and its description, and nothing more", () => {
    const editor = useAboutEditor(ABOUT_PAGE);
    expect(editor.form.id).toBe("about");
    expect(
      editor.form.config.fields.map((field) => [field.key, field.type]),
    ).toEqual([
      ["title", "text"],
      ["description", "textarea"],
    ]);
    expect(editor.form.payload).toEqual(FILLED);
  });

  it("names each field for the reader, and needs a title alone", () => {
    const { fields } = useAboutEditor(ABOUT_PAGE).form.config;
    expect(fields.map((field) => field.label)).toEqual([
      "Title",
      "Description",
    ]);
    expect(
      fields.filter((field) => field.required).map((field) => field.key),
    ).toEqual(["title"]);
  });

  it("replaces the page's metadata, and stays on what was kept", async () => {
    const changed = { ...ABOUT_PAGE, title: "Who We Are" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const editor = useAboutEditor(ABOUT_PAGE);
    editor.form.set("title", " Who We Are ");
    await editor.save();
    expect(fetch).toHaveBeenCalledWith("/api/site/about", {
      method: "PUT",
      body: { ...FILLED, title: "Who We Are" },
    });
    expect(editor.form.payload.title).toBe("Who We Are");
    expect(editor.dirty.value).toBe(false);
  });

  it("writes no description once it is cleared", async () => {
    const fetch = vi.fn(async () => ABOUT_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const editor = useAboutEditor(ABOUT_PAGE);
    editor.form.set("description", "  ");
    expect(editor.form.payload.description).toBeUndefined();
    await editor.save();
    expect(fetch).toHaveBeenCalledWith("/api/site/about", {
      method: "PUT",
      body: { title: "About Us", description: undefined },
    });
  });

  it("keeps the form open on a title left blank", async () => {
    const fetch = vi.fn(async () => ABOUT_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const editor = useAboutEditor(ABOUT_PAGE);
    editor.form.set("title", " ");
    await editor.save();
    expect(fetch).not.toHaveBeenCalled();
    expect(editor.form.field("title").error).toBeDefined();
    expect(editor.error.value).toBeNull();
  });
});
