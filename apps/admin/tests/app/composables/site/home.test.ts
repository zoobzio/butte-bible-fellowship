import { describe, expect, it, vi } from "vitest";

import { toRaw, useRouter } from "#imports";
import { HOME_PAGE } from "#test/support/records";
import { useHomeEditor } from "~/composables/site/home";

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
      ["heroImage", "image"],
      ["heroHeading", "text"],
      ["heroDescription", "textarea"],
      ["heroAction", "text"],
      ["heroLink", "text"],
    ]);
    expect(editor.form.payload).toEqual(FILLED);
  });

  it("is one column: no field is given a span, all but the description and the picture must be filled in, and what is written on the page is not one", () => {
    const { fields } = useHomeEditor(HOME_PAGE).form.config;
    expect(fields.every((field) => field.colspan === undefined)).toBe(true);
    expect(
      fields.filter((field) => !field.required).map((field) => field.key),
    ).toEqual(["description", "heroImage"]);
    const { payload } = useHomeEditor(HOME_PAGE).form;
    for (const key of ["body", "slug", "id", "updatedAt"]) {
      expect(payload).not.toHaveProperty(key);
    }
  });

  it("names each field for the reader, with no hint under any", () => {
    const { fields } = useHomeEditor(HOME_PAGE).form.config;
    expect(fields.map((field) => field.label)).toEqual([
      "Title",
      "Description",
      "Hero image",
      "Hero heading",
      "Hero text",
      "Button label",
      "Button link",
    ]);
    expect(fields.every((field) => field.hint === undefined)).toBe(true);
  });

  it("takes the hero's picture of the kinds the schema takes, and says what its control does", () => {
    const editor = useHomeEditor(HOME_PAGE);
    expect(
      editor.form.config.fields.find((field) => field.key === "heroImage"),
    ).toMatchObject({ accept: "image/jpeg,image/png,image/webp" });
    expect(editor.picture).toEqual({
      upload: "Upload hero image",
      change: "Change hero image",
      remove: "Remove hero image",
      none: "No hero image",
    });
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
    expect(fetch).toHaveBeenCalledWith("/api/site/home", {
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
    expect(fetch).toHaveBeenCalledWith("/api/site/home", {
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
    expect(fetch).toHaveBeenCalledWith("/api/site/home", {
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

  const PICTURE = "https://cdn.example.com/kept.jpg";
  const PICTURED = { ...HOME_PAGE, heroImage: PICTURE };
  const picked = () =>
    new File([new Uint8Array(8)], "picked.png", { type: "image/png" });
  /** What was asked of the server, in order: where, and how. */
  const asked = (fetch: { mock: { calls: unknown[][] } }) =>
    fetch.mock.calls.map(([path, request]) => [
      path,
      (request as { method: string }).method,
    ]);

  it("uploads an image picked for the hero's picture after the details, in a request of its own, and holds the one kept", async () => {
    const fetch = vi.fn(async (path: string, _?: unknown) =>
      path === "/api/site/home/image" ? PICTURED : HOME_PAGE,
    );
    vi.stubGlobal("$fetch", fetch);
    const editor = useHomeEditor(HOME_PAGE);
    const file = picked();
    editor.form.set("heroImage", file);
    expect(editor.dirty.value).toBe(true);
    await editor.save();
    expect(asked(fetch)).toEqual([
      ["/api/site/home", "PUT"],
      ["/api/site/home/image", "PATCH"],
    ]);
    const [details, upload] = fetch.mock.calls.map(
      ([, request]) => (request as { body: unknown }).body,
    );
    expect(details).not.toHaveProperty("heroImage");
    expect(upload).toBeInstanceOf(FormData);
    expect(toRaw((upload as FormData).get("file"))).toBe(file);
    expect(editor.form.payload.heroImage).toBe(PICTURE);
    expect(editor.dirty.value).toBe(false);
    expect(editor.error.value).toBeNull();
  });

  it("removes the hero's picture once the form holds none, and leaves the one kept alone otherwise", async () => {
    const fetch = vi.fn(async (path: string, _?: unknown) =>
      path === "/api/site/home/image" ? HOME_PAGE : PICTURED,
    );
    vi.stubGlobal("$fetch", fetch);
    const editor = useHomeEditor(PICTURED);
    expect(editor.form.payload.heroImage).toBe(PICTURE);
    await editor.save();
    expect(asked(fetch)).toEqual([["/api/site/home", "PUT"]]);
    expect(editor.form.payload.heroImage).toBe(PICTURE);

    fetch.mockClear();
    editor.form.set("heroImage", undefined);
    expect(editor.dirty.value).toBe(true);
    await editor.save();
    expect(asked(fetch)).toEqual([
      ["/api/site/home", "PUT"],
      ["/api/site/home/image", "DELETE"],
    ]);
    expect(editor.form.payload.heroImage).toBeUndefined();
    expect(editor.dirty.value).toBe(false);
  });

  it("refuses a file that cannot be the hero's picture at its field, and sends nothing", async () => {
    const fetch = vi.fn(async () => HOME_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const editor = useHomeEditor(HOME_PAGE);
    editor.form.set(
      "heroImage",
      new File(["x"], "notes.pdf", { type: "application/pdf" }),
    );
    await editor.save();
    expect(fetch).not.toHaveBeenCalled();
    expect(editor.form.field("heroImage").error).toBe(
      "That file can’t be used. Choose a JPEG, PNG or WebP image of 4 MB or less.",
    );
    expect(editor.error.value).toBeNull();
  });

  it("keeps the image picked when its upload fails, the details saved, and puts the hero's picture back on a reset", async () => {
    const changed = { ...HOME_PAGE, title: "Welcome" };
    const fetch = vi.fn(async (path: string, _?: unknown) => {
      if (path === "/api/site/home/image")
        throw new Error("The store is away.");
      return changed;
    });
    vi.stubGlobal("$fetch", fetch);
    const editor = useHomeEditor(HOME_PAGE);
    const file = picked();
    editor.form.set("title", "Welcome");
    editor.form.set("heroImage", file);
    await editor.save();
    expect(editor.error.value).toBe("The store is away.");
    expect(toRaw(editor.form.payload.heroImage)).toBe(file);
    expect(editor.dirty.value).toBe(true);
    editor.reset();
    expect(editor.form.payload.heroImage).toBeUndefined();
    expect(editor.form.payload.title).toBe("Welcome");
    expect(editor.error.value).toBeNull();
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
    expect(fetch).toHaveBeenCalledWith("/api/site/home", {
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
