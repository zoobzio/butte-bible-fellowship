import { describe, expect, it, vi } from "vitest";

import { toRaw, useRouter } from "#imports";
import { PERSON } from "#test/support/records";
import { usePersonEditor } from "~/composables/people/editor";

describe("usePersonEditor", () => {
  const BODY = {
    firstName: "Jane",
    lastName: "Doe",
    role: "elder",
    summary: "Has served since 2010.",
    email: "jane@example.com",
  };

  it("is the person form, blank for a new person, who is a person until given another role", () => {
    const editor = usePersonEditor(null);
    expect(editor.form.id).toBe("person");
    expect(editor.form.config.fields.map((field) => field.key)).toEqual([
      "firstName",
      "lastName",
      "role",
      "title",
      "email",
      "phone",
      "address",
      "birthday",
      "summary",
    ]);
    expect(editor.form.payload).toEqual({ role: "member" });
  });

  it("opens on a person's details", () => {
    const editor = usePersonEditor(PERSON);
    expect(editor.form.payload).toEqual(BODY);
  });

  it("opens on all that is kept of a person, and writes it back", async () => {
    const kept = {
      title: "Worship Director",
      address: "123 Main St\nButte, MT 59701",
      birthday: "1980-04-12",
    };
    const fetch = vi.fn(async () => ({ ...PERSON, ...kept }));
    vi.stubGlobal("$fetch", fetch);
    const editor = usePersonEditor({ ...PERSON, ...kept });
    expect(editor.form.payload).toEqual({ ...BODY, ...kept });
    editor.form.set("title", " ");
    expect(editor.form.payload.title).toBeUndefined();
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/people/1", {
      method: "PUT",
      body: { ...BODY, ...kept, title: undefined },
    });
  });

  it("is one column of their details: no field is given a span, and the bio is not one", () => {
    const { fields } = usePersonEditor({
      ...PERSON,
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
    }).form.config;
    expect(fields.every((field) => field.colspan === undefined)).toBe(true);
    expect(usePersonEditor(PERSON).form.payload).not.toHaveProperty("bio");
  });

  it("has the photo of a person that exists as the first of their fields, of the kinds the schema takes, and none for a new one", () => {
    const [first, second] = usePersonEditor(PERSON).form.config.fields;
    expect(first).toMatchObject({
      type: "image",
      key: "photo",
      label: "Photo",
      accept: "image/jpeg,image/png,image/webp",
    });
    expect(first?.required).toBeUndefined();
    expect(second?.key).toBe("firstName");
    expect(
      usePersonEditor(null).form.config.fields.some(
        (field) => field.type === "image",
      ),
    ).toBe(false);
  });

  it("starts over from the record, whatever the last visit left", () => {
    usePersonEditor(PERSON).form.set("firstName", "Someone");
    expect(usePersonEditor(null).form.payload).toEqual({ role: "member" });
    expect(usePersonEditor(PERSON).form.payload.firstName).toBe("Jane");
  });

  it("offers each role by name, and no status", () => {
    const { fields } = usePersonEditor(null).form.config;
    const options = (key: string) =>
      fields.flatMap((field) =>
        field.key === key && "options" in field ? field.options : [],
      );
    expect(options("role")).toEqual([
      { value: "pastor", label: "Pastor" },
      { value: "elder", label: "Elder" },
      { value: "staff", label: "Staff" },
      { value: "member", label: "Member" },
    ]);
    expect(options("status")).toEqual([]);
  });

  it("creates a person from what is written, and opens their page, where the photo and the bio wait", async () => {
    const fetch = vi.fn(async () => PERSON);
    vi.stubGlobal("$fetch", fetch);
    const editor = usePersonEditor(null);
    editor.form.set("firstName", " John ");
    editor.form.set("lastName", " Roe ");
    editor.form.set("role", "staff");
    editor.form.set("email", "");
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/people", {
      method: "POST",
      body: { firstName: "John", lastName: "Roe", role: "staff" },
    });
    expect(useRouter().push).toHaveBeenCalledWith("/people/1/profile");
    expect(editor.form.submitted).toBe(true);
    expect(editor.error.value).toBeNull();
  });

  it("replaces the person's details when there is a record, stays, and hands the record saved on", async () => {
    const changed = { ...PERSON, role: "pastor" as const };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const saved = vi.fn();
    const editor = usePersonEditor(PERSON, saved);
    editor.form.set("role", "pastor");
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/people/1", {
      method: "PUT",
      body: { ...BODY, role: "pastor" },
    });
    expect(saved).toHaveBeenCalledWith(changed);
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(editor.form.submitted).toBe(true);
    expect(editor.form.payload.role).toBe("pastor");
  });

  it("writes no summary once the field is cleared", async () => {
    const fetch = vi.fn(async () => PERSON);
    vi.stubGlobal("$fetch", fetch);
    const editor = usePersonEditor(PERSON);
    editor.form.set("summary", " ");
    expect(editor.form.payload.summary).toBeUndefined();
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/people/1", {
      method: "PUT",
      body: { ...BODY, summary: undefined },
    });
  });

  it("keeps the form open with what is wrong, field by field", async () => {
    const fetch = vi.fn(async () => PERSON);
    vi.stubGlobal("$fetch", fetch);
    const editor = usePersonEditor(null);
    editor.form.set("email", "jane");
    await editor.form.submit();
    expect(fetch).not.toHaveBeenCalled();
    expect(editor.form.field("firstName").error).toBeDefined();
    expect(editor.form.field("lastName").error).toBeDefined();
    expect(editor.form.field("role").error).toBeUndefined();
    expect(editor.form.field("email").error).toBeDefined();
    expect(editor.form.field("phone").error).toBeUndefined();
    expect(editor.error.value).toBeNull();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("refuses a phone number that is not one, as the field is left and on a save", async () => {
    const fetch = vi.fn(async () => PERSON);
    vi.stubGlobal("$fetch", fetch);
    const editor = usePersonEditor(PERSON);
    editor.form.set("phone", "asdf");
    editor.form.touch("phone");
    expect(editor.form.check("phone")).toBe(false);
    expect(editor.form.field("phone").error).toBe(
      "Invalid phone number: ten digits, like 530-555-0100",
    );
    await editor.form.submit();
    expect(fetch).not.toHaveBeenCalled();
    expect(editor.form.field("phone").error).toBeDefined();
  });

  it("writes a phone number the one way it is kept, and shows it so once saved", async () => {
    const changed = { ...PERSON, phone: "530-555-0100" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const editor = usePersonEditor(PERSON);
    editor.form.set("phone", "(530) 555-0100");
    expect(editor.form.check("phone")).toBe(true);
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/people/1", {
      method: "PUT",
      body: { ...BODY, phone: "530-555-0100" },
    });
    expect(editor.form.payload.phone).toBe("530-555-0100");
  });

  it("writes no phone number once the field is cleared", async () => {
    const fetch = vi.fn(async () => PERSON);
    vi.stubGlobal("$fetch", fetch);
    const editor = usePersonEditor({ ...PERSON, phone: "530-555-0100" });
    editor.form.set("phone", "");
    expect(editor.form.payload.phone).toBeUndefined();
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/people/1", {
      method: "PUT",
      body: { ...BODY, phone: undefined },
    });
  });

  it("says what went wrong when the save fails, and stays, until the next try", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const editor = usePersonEditor(PERSON);
    await expect(editor.form.submit()).rejects.toThrow("The server is away.");
    expect(editor.error.value).toBe("The server is away.");
    expect(editor.form.submitting).toBe(false);
    expect(editor.form.submitted).toBe(false);
    expect(useRouter().push).not.toHaveBeenCalled();

    editor.form.set("email", "jane");
    await editor.form.submit();
    expect(editor.error.value).toBeNull();
  });

  const PICTURE = "https://cdn.example.com/kept.jpg";
  const PICTURED = { ...PERSON, photo: PICTURE };
  const picked = () =>
    new File([new Uint8Array(8)], "picked.png", { type: "image/png" });
  /** What was asked of the server, in order: where, and how. */
  const asked = (fetch: { mock: { calls: unknown[][] } }) =>
    fetch.mock.calls.map(([path, request]) => [
      path,
      (request as { method: string }).method,
    ]);

  it("uploads an image picked for their photo after the details, in a request of its own, and holds the one kept", async () => {
    const fetch = vi.fn(async (path: string, _?: unknown) =>
      path === "/api/people/1/avatar" ? PICTURED : PERSON,
    );
    vi.stubGlobal("$fetch", fetch);
    const editor = usePersonEditor(PERSON);
    const file = picked();
    editor.form.set("photo", file);
    expect(editor.dirty.value).toBe(true);
    await editor.save();
    expect(asked(fetch)).toEqual([
      ["/api/people/1", "PUT"],
      ["/api/people/1/avatar", "PATCH"],
    ]);
    const [details, upload] = fetch.mock.calls.map(
      ([, request]) => (request as { body: unknown }).body,
    );
    expect(details).not.toHaveProperty("photo");
    expect(upload).toBeInstanceOf(FormData);
    expect(toRaw((upload as FormData).get("file"))).toBe(file);
    expect(editor.form.payload.photo).toBe(PICTURE);
    expect(editor.dirty.value).toBe(false);
    expect(editor.error.value).toBeNull();
  });

  it("removes their photo once the form holds none, and leaves the one kept alone otherwise", async () => {
    const fetch = vi.fn(async (path: string, _?: unknown) =>
      path === "/api/people/1/avatar" ? PERSON : PICTURED,
    );
    vi.stubGlobal("$fetch", fetch);
    const editor = usePersonEditor(PICTURED);
    expect(editor.form.payload.photo).toBe(PICTURE);
    await editor.save();
    expect(asked(fetch)).toEqual([["/api/people/1", "PUT"]]);
    expect(editor.form.payload.photo).toBe(PICTURE);

    fetch.mockClear();
    editor.form.set("photo", undefined);
    expect(editor.dirty.value).toBe(true);
    await editor.save();
    expect(asked(fetch)).toEqual([
      ["/api/people/1", "PUT"],
      ["/api/people/1/avatar", "DELETE"],
    ]);
    expect(editor.form.payload.photo).toBeUndefined();
    expect(editor.dirty.value).toBe(false);
  });

  it("refuses a file that cannot be their photo at its field, and sends nothing", async () => {
    const fetch = vi.fn(async () => PERSON);
    vi.stubGlobal("$fetch", fetch);
    const editor = usePersonEditor(PERSON);
    editor.form.set(
      "photo",
      new File(["x"], "notes.pdf", { type: "application/pdf" }),
    );
    await editor.save();
    expect(fetch).not.toHaveBeenCalled();
    expect(editor.form.field("photo").error).toBe(
      "That file can’t be used. Choose a JPEG, PNG or WebP image of 4 MB or less.",
    );
    expect(editor.error.value).toBeNull();
  });

  it("keeps the image picked when its upload fails, the details saved, and puts their photo back on a reset", async () => {
    const changed = { ...PERSON, lastName: "Roe", name: "Jane Roe" };
    const fetch = vi.fn(async (path: string, _?: unknown) => {
      if (path === "/api/people/1/avatar")
        throw new Error("The store is away.");
      return changed;
    });
    vi.stubGlobal("$fetch", fetch);
    const editor = usePersonEditor(PERSON);
    const file = picked();
    editor.form.set("lastName", "Roe");
    editor.form.set("photo", file);
    await editor.save();
    expect(editor.error.value).toBe("The store is away.");
    expect(toRaw(editor.form.payload.photo)).toBe(file);
    expect(editor.dirty.value).toBe(true);
    editor.reset();
    expect(editor.form.payload.photo).toBeUndefined();
    expect(editor.form.payload.lastName).toBe("Roe");
    expect(editor.error.value).toBeNull();
  });

  it("is clean on the record as it was saved, and dirty from the first change", () => {
    const editor = usePersonEditor(PERSON);
    expect(editor.dirty.value).toBe(false);
    expect(editor.saving.value).toBe(false);
    editor.form.set("lastName", "Roe");
    expect(editor.dirty.value).toBe(true);
  });

  it("saves for the page that saves the whole record, and is clean again", async () => {
    const changed = { ...PERSON, lastName: "Roe", name: "Jane Roe" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const saved = vi.fn();
    const editor = usePersonEditor(PERSON, saved);
    editor.form.set("lastName", "Roe");
    await editor.save();
    expect(fetch).toHaveBeenCalledWith("/api/people/1", {
      method: "PUT",
      body: expect.objectContaining({ firstName: "Jane", lastName: "Roe" }),
    });
    expect(saved).toHaveBeenCalledWith(changed);
    expect(editor.dirty.value).toBe(false);
    expect(editor.error.value).toBeNull();
  });

  it("puts the fields back as they were last saved on a reset, with what was wrong", async () => {
    const editor = usePersonEditor(PERSON);
    editor.form.set("email", "jane");
    await editor.save();
    expect(editor.form.valid).toBe(false);
    expect(editor.dirty.value).toBe(true);
    editor.reset();
    expect(editor.form.payload.lastName).toBe("Doe");
    expect(editor.form.errors).toEqual({});
    expect(editor.dirty.value).toBe(false);

    const changed = { ...PERSON, lastName: "Roe", name: "Jane Roe" };
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => changed),
    );
    editor.form.set("lastName", "Roe");
    await editor.save();
    editor.form.set("lastName", "Slip");
    editor.reset();
    expect(editor.form.payload.lastName).toBe("Roe");
  });

  it("saves without throwing: what fails reports through the error, which a reset clears", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const editor = usePersonEditor(PERSON);
    editor.form.set("lastName", "Roe");
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
    const editor = usePersonEditor(PERSON);
    editor.form.set("lastName", "Roe");
    const saving = editor.save();
    expect(editor.saving.value).toBe(true);
    editor.reset();
    expect(editor.form.payload.lastName).toBe("Roe");
    answer({ ...PERSON, lastName: "Roe", name: "Jane Roe" });
    await saving;
    expect(editor.saving.value).toBe(false);
  });
});
