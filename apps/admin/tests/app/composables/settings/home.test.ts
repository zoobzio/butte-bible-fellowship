import { describe, expect, it, vi } from "vitest";

import { useRouter } from "#imports";
import { HOME_PAGE } from "#test/support/records";
import { useHomeEditor } from "~/composables/settings/home";

/** What the form holds, which is what a save of it as it stands writes. */
const { body: _, updatedAt: __, ...FILLED } = HOME_PAGE;
const WRITTEN = FILLED;

describe("useHomeEditor", () => {
  it("is the home form, on the page's metadata: what is shown for it, and the words of its hero", () => {
    const editor = useHomeEditor(HOME_PAGE);
    expect(editor.form.id).toBe("home");
    expect(
      editor.form.config.fields.map((field) => [field.key, field.type]),
    ).toEqual([
      ["title", "text"],
      ["description", "textarea"],
      ["heroHeading", "text"],
      ["heroDescription", "textarea"],
      ["heroAction", "text"],
      ["heroLink", "text"],
    ]);
    expect(editor.form.payload).toEqual(FILLED);
  });

  it("is one column: no field is given a span, all but the description must be filled in, and neither the picture nor what is written on the page is one", () => {
    const { fields } = useHomeEditor(HOME_PAGE).form.config;
    expect(fields.every((field) => field.colspan === undefined)).toBe(true);
    expect(
      fields.filter((field) => !field.required).map((field) => field.key),
    ).toEqual(["description"]);
    const { payload } = useHomeEditor(HOME_PAGE).form;
    for (const key of ["body", "slug", "id", "updatedAt", "heroImage"]) {
      expect(payload).not.toHaveProperty(key);
    }
  });

  it("names each field for the reader, with no hint under any", () => {
    const { fields } = useHomeEditor(HOME_PAGE).form.config;
    expect(fields.map((field) => field.label)).toEqual([
      "Title",
      "Description",
      "Hero heading",
      "Hero text",
      "Button label",
      "Button link",
    ]);
    expect(fields.every((field) => field.hint === undefined)).toBe(true);
  });

  it("starts over from the record, whatever the last visit left", () => {
    useHomeEditor(HOME_PAGE).form.set("title", "Something Else");
    expect(useHomeEditor(HOME_PAGE).form.payload.title).toBe(
      "Butte Bible Fellowship",
    );
  });

  it("replaces the page's metadata, trimmed, and stays on what was kept", async () => {
    const changed = { ...HOME_PAGE, heroAction: "Plan a visit" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const editor = useHomeEditor(HOME_PAGE);
    editor.form.set("heroAction", " Plan a visit ");
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/settings/home", {
      method: "PUT",
      body: { ...WRITTEN, heroAction: "Plan a visit" },
    });
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(editor.form.submitted).toBe(true);
    expect(editor.form.payload).toEqual({
      ...FILLED,
      heroAction: "Plan a visit",
    });
    expect(editor.error.value).toBeNull();
  });

  it("writes the heading as the line it is typed as, its asterisks kept", async () => {
    const fetch = vi.fn(async () => HOME_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const editor = useHomeEditor(HOME_PAGE);
    editor.form.set("heroHeading", " Come and **see** ");
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/settings/home", {
      method: "PUT",
      body: { ...WRITTEN, heroHeading: "Come and **see**" },
    });
  });

  it("writes no description once the field is cleared", async () => {
    const fetch = vi.fn(async () => HOME_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const editor = useHomeEditor(HOME_PAGE);
    editor.form.set("description", " ");
    expect(editor.form.payload.description).toBeUndefined();
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/settings/home", {
      method: "PUT",
      body: { ...WRITTEN, description: undefined },
    });
  });

  it("keeps the form open with what is wrong, field by field: a heading emptied, a line left blank, a link that is not one", async () => {
    const fetch = vi.fn(async () => HOME_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const editor = useHomeEditor(HOME_PAGE);
    editor.form.set("heroHeading", " ");
    editor.form.set("heroAction", "  ");
    editor.form.set("heroLink", "about-us");
    await editor.form.submit();
    expect(fetch).not.toHaveBeenCalled();
    for (const key of ["heroHeading", "heroAction", "heroLink"] as const) {
      expect(editor.form.field(key).error, key).toBeDefined();
    }
    expect(editor.form.field("title").error).toBeUndefined();
    expect(editor.error.value).toBeNull();
    editor.form.set("heroLink", "https://example.com/visit");
    expect(editor.form.check("heroLink")).toBe(true);
  });

  it("says what went wrong when the save fails, and stays, until the next try", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const editor = useHomeEditor(HOME_PAGE);
    await expect(editor.form.submit()).rejects.toThrow("The server is away.");
    expect(editor.error.value).toBe("The server is away.");
    expect(editor.form.submitting).toBe(false);
    expect(editor.form.submitted).toBe(false);

    editor.form.set("title", " ");
    await editor.form.submit();
    expect(editor.error.value).toBeNull();
  });

  it("says something went wrong when the failure says nothing itself", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw {};
      }),
    );
    const editor = useHomeEditor(HOME_PAGE);
    await editor.save();
    expect(editor.error.value).toBe("Something went wrong.");
  });

  it("is clean on the record as it was saved, and dirty from the first change", () => {
    const editor = useHomeEditor(HOME_PAGE);
    expect(editor.dirty.value).toBe(false);
    expect(editor.saving.value).toBe(false);
    editor.form.set("title", "Welcome");
    expect(editor.dirty.value).toBe(true);
  });

  it("saves for the bar that saves the whole page, and is clean again", async () => {
    const changed = { ...HOME_PAGE, title: "Welcome" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const editor = useHomeEditor(HOME_PAGE);
    editor.form.set("title", "Welcome");
    await editor.save();
    expect(fetch).toHaveBeenCalledWith("/api/settings/home", {
      method: "PUT",
      body: expect.objectContaining({ title: "Welcome" }),
    });
    expect(editor.dirty.value).toBe(false);
    expect(editor.error.value).toBeNull();
  });

  it("puts the fields back as they were last saved on a reset, with what was wrong", async () => {
    const editor = useHomeEditor(HOME_PAGE);
    editor.form.set("heroLink", "not a link");
    await editor.save();
    expect(editor.form.valid).toBe(false);
    expect(editor.dirty.value).toBe(true);
    editor.reset();
    expect(editor.form.payload.heroLink).toBe("/about-us");
    expect(editor.form.errors).toEqual({});
    expect(editor.dirty.value).toBe(false);

    const changed = { ...HOME_PAGE, title: "Welcome" };
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => changed),
    );
    editor.form.set("title", "Welcome");
    await editor.save();
    editor.form.set("title", "Another Slip");
    editor.reset();
    expect(editor.form.payload.title).toBe("Welcome");
  });

  it("saves without throwing: what fails reports through the error, which a reset clears", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const editor = useHomeEditor(HOME_PAGE);
    editor.form.set("title", "Welcome");
    await editor.save();
    expect(editor.error.value).toBe("The server is away.");
    expect(editor.dirty.value).toBe(true);
    editor.reset();
    expect(editor.error.value).toBeNull();
  });

  it("is not reset under a save", async () => {
    let answer = (_: unknown) => {};
    vi.stubGlobal(
      "$fetch",
      vi.fn(() => new Promise<unknown>((resolve) => (answer = resolve))),
    );
    const editor = useHomeEditor(HOME_PAGE);
    editor.form.set("title", "Welcome");
    const saving = editor.save();
    expect(editor.saving.value).toBe(true);
    editor.reset();
    expect(editor.form.payload.title).toBe("Welcome");
    answer({ ...HOME_PAGE, title: "Welcome" });
    await saving;
    expect(editor.saving.value).toBe(false);
  });
});
