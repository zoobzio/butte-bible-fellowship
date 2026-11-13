import { describe, expect, it, vi } from "vitest";

import { useRouter } from "#imports";
import { ABOUT, HOME } from "#test/support/records";
import { useContentEditor } from "~/composables/content/editor";

describe("useContentEditor", () => {
  const FILLED = {
    slug: "index",
    title: "Butte Bible Fellowship",
    description: "A local church in Chico.",
  };

  const BARE = { slug: "about-us", title: "About Us" };

  it("is the content form, blank for a new page", () => {
    const editor = useContentEditor(null);
    expect(editor.form.id).toBe("content");
    expect(editor.form.config.fields.map((field) => field.key)).toEqual([
      "title",
      "slug",
      "description",
    ]);
    expect(editor.form.config.fields.map((field) => field.type)).toEqual([
      "text",
      "text",
      "textarea",
    ]);
    expect(editor.form.payload).toEqual({});
  });

  it("opens on a page's metadata", () => {
    expect(useContentEditor(HOME).form.payload).toEqual(FILLED);
    expect(useContentEditor(ABOUT).form.payload).toEqual({
      ...BARE,
      description: undefined,
    });
  });

  it("is one column of metadata: no field is given a span, and neither a hero nor what is written on the page is one", () => {
    const { fields } = useContentEditor(HOME).form.config;
    expect(fields.every((field) => field.colspan === undefined)).toBe(true);
    expect(
      fields.filter((field) => field.required).map((field) => field.key),
    ).toEqual(["title", "slug"]);
    expect(fields.some((field) => /hero|cta/i.test(String(field.key)))).toBe(
      false,
    );
    const { payload } = useContentEditor(HOME).form;
    for (const key of ["body", "hero", "id", "status"]) {
      expect(payload).not.toHaveProperty(key);
    }
  });

  it("starts over from the record, whatever the last visit left", () => {
    useContentEditor(HOME).form.set("title", "Something Else");
    expect(useContentEditor(null).form.payload).toEqual({});
    expect(useContentEditor(HOME).form.payload.title).toBe(
      "Butte Bible Fellowship",
    );
  });

  it("creates a page from what is written, and opens its own page, where the writing waits", async () => {
    const fetch = vi.fn(async () => ABOUT);
    vi.stubGlobal("$fetch", fetch);
    const editor = useContentEditor(null);
    editor.form.set("title", " About Us ");
    editor.form.set("slug", "about-us");
    editor.form.set("description", "");
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/content", {
      method: "POST",
      body: { ...BARE, description: undefined },
    });
    expect(useRouter().push).toHaveBeenCalledWith("/content/6/page");
    expect(editor.form.submitted).toBe(true);
    expect(editor.error.value).toBeNull();
  });

  it("replaces the page's metadata when there is a record, stays, and hands the record saved on", async () => {
    const changed = { ...HOME, title: "Welcome" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const saved = vi.fn();
    const editor = useContentEditor(HOME, saved);
    editor.form.set("title", "Welcome");
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/content/5", {
      method: "PUT",
      body: { ...FILLED, title: "Welcome" },
    });
    expect(saved).toHaveBeenCalledWith(changed);
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(editor.form.submitted).toBe(true);
    expect(editor.form.payload).toMatchObject({ title: "Welcome" });
  });

  it("writes no description once the field is cleared", async () => {
    const fetch = vi.fn(async () => HOME);
    vi.stubGlobal("$fetch", fetch);
    const editor = useContentEditor(HOME);
    editor.form.set("description", " ");
    expect(editor.form.payload.description).toBeUndefined();
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/content/5", {
      method: "PUT",
      body: { ...FILLED, description: undefined },
    });
  });

  it("keeps the form open with what is wrong, field by field", async () => {
    const fetch = vi.fn(async () => ABOUT);
    vi.stubGlobal("$fetch", fetch);
    const editor = useContentEditor(null);
    await editor.form.submit();
    expect(fetch).not.toHaveBeenCalled();
    for (const key of ["title", "slug"] as const) {
      expect(editor.form.field(key).error, key).toBeDefined();
    }
    expect(editor.form.field("description").error).toBeUndefined();
    expect(editor.error.value).toBeNull();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("refuses a slug that is not one, as the field is left and on a save", async () => {
    const fetch = vi.fn(async () => ABOUT);
    vi.stubGlobal("$fetch", fetch);
    const editor = useContentEditor(ABOUT);
    editor.form.set("slug", "About Us Page");
    editor.form.touch("slug");
    expect(editor.form.check("slug")).toBe(false);
    await editor.form.submit();
    expect(fetch).not.toHaveBeenCalled();
    editor.form.set("slug", "about-us");
    expect(editor.form.check("slug")).toBe(true);
  });

  it("says what went wrong when the save fails, and stays, until the next try", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const editor = useContentEditor(HOME);
    await expect(editor.form.submit()).rejects.toThrow("The server is away.");
    expect(editor.error.value).toBe("The server is away.");
    expect(editor.form.submitting).toBe(false);
    expect(editor.form.submitted).toBe(false);
    expect(useRouter().push).not.toHaveBeenCalled();

    editor.form.set("title", " ");
    await editor.form.submit();
    expect(editor.error.value).toBeNull();
  });

  it("is clean on the record as it was saved, and dirty from the first change", () => {
    const editor = useContentEditor(HOME);
    expect(editor.dirty.value).toBe(false);
    expect(editor.saving.value).toBe(false);
    editor.form.set("title", "Welcome");
    expect(editor.dirty.value).toBe(true);
  });

  it("saves for the page that saves the whole record, and is clean again", async () => {
    const changed = { ...HOME, title: "Welcome" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const saved = vi.fn();
    const editor = useContentEditor(HOME, saved);
    editor.form.set("title", "Welcome");
    await editor.save();
    expect(fetch).toHaveBeenCalledWith("/api/content/5", {
      method: "PUT",
      body: expect.objectContaining({ title: "Welcome" }),
    });
    expect(saved).toHaveBeenCalledWith(changed);
    expect(editor.dirty.value).toBe(false);
    expect(editor.error.value).toBeNull();
  });

  it("puts the fields back as they were last saved on a reset, with what was wrong", async () => {
    const editor = useContentEditor(HOME);
    editor.form.set("slug", "Not A Slug");
    await editor.save();
    expect(editor.form.valid).toBe(false);
    expect(editor.dirty.value).toBe(true);
    editor.reset();
    expect(editor.form.payload.title).toBe("Butte Bible Fellowship");
    expect(editor.form.errors).toEqual({});
    expect(editor.dirty.value).toBe(false);

    const changed = { ...HOME, title: "Welcome" };
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
    const editor = useContentEditor(HOME);
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
    const editor = useContentEditor(HOME);
    editor.form.set("title", "Welcome");
    const saving = editor.save();
    expect(editor.saving.value).toBe(true);
    editor.reset();
    expect(editor.form.payload.title).toBe("Welcome");
    answer({ ...HOME, title: "Welcome" });
    await saving;
    expect(editor.saving.value).toBe(false);
  });
});
