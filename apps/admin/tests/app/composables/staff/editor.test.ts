import { describe, expect, it, vi } from "vitest";

import { useRouter } from "#imports";
import { STAFF } from "#test/support/records";
import { useStaffEditor } from "~/composables/staff/editor";

describe("useStaffEditor", () => {
  const BODY = {
    name: "Jane Doe",
    role: "elder",
    summary: "Has served since 2010.",
    email: "jane@example.com",
  };

  it("is the staff form, blank for a new member, with no role", () => {
    const editor = useStaffEditor(null);
    expect(editor.form.id).toBe("staff");
    expect(editor.form.config.fields.map((field) => field.key)).toEqual([
      "name",
      "role",
      "email",
      "phone",
      "summary",
    ]);
    expect(editor.form.payload).toEqual({});
  });

  it("opens on a member's details", () => {
    const editor = useStaffEditor(STAFF);
    expect(editor.form.payload).toEqual(BODY);
  });

  it("is one column of their details: no field is given a span, and neither the photo nor the bio is one", () => {
    const { fields } = useStaffEditor({
      ...STAFF,
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
    }).form.config;
    expect(fields.every((field) => field.colspan === undefined)).toBe(true);
    expect(useStaffEditor(STAFF).form.payload).not.toHaveProperty("bio");
    expect(useStaffEditor(STAFF).form.payload).not.toHaveProperty("photo");
  });

  it("starts over from the record, whatever the last visit left", () => {
    useStaffEditor(STAFF).form.set("name", "Someone Else");
    expect(useStaffEditor(null).form.payload).toEqual({});
    expect(useStaffEditor(STAFF).form.payload.name).toBe("Jane Doe");
  });

  it("offers each role by name, and no status", () => {
    const { fields } = useStaffEditor(null).form.config;
    const options = (key: string) =>
      fields.flatMap((field) =>
        field.key === key && "options" in field ? field.options : [],
      );
    expect(options("role")).toEqual([
      { value: "pastor", label: "Pastor" },
      { value: "elder", label: "Elder" },
      { value: "staff", label: "Staff" },
    ]);
    expect(options("status")).toEqual([]);
  });

  it("creates a member from what is written, and opens their page, where the photo and the bio wait", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const editor = useStaffEditor(null);
    editor.form.set("name", " John Roe ");
    editor.form.set("role", "staff");
    editor.form.set("email", "");
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      method: "POST",
      body: { name: "John Roe", role: "staff" },
    });
    expect(useRouter().push).toHaveBeenCalledWith("/staff/1/profile");
    expect(editor.form.submitted).toBe(true);
    expect(editor.error.value).toBeNull();
  });

  it("replaces the member's details when there is a record, stays, and hands the record saved on", async () => {
    const changed = { ...STAFF, role: "pastor" as const };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const saved = vi.fn();
    const editor = useStaffEditor(STAFF, saved);
    editor.form.set("role", "pastor");
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", {
      method: "PUT",
      body: { ...BODY, role: "pastor" },
    });
    expect(saved).toHaveBeenCalledWith(changed);
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(editor.form.submitted).toBe(true);
    expect(editor.form.payload.role).toBe("pastor");
  });

  it("writes no summary once the field is cleared", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const editor = useStaffEditor(STAFF);
    editor.form.set("summary", " ");
    expect(editor.form.payload.summary).toBeUndefined();
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", {
      method: "PUT",
      body: { ...BODY, summary: undefined },
    });
  });

  it("keeps the form open with what is wrong, field by field", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const editor = useStaffEditor(null);
    editor.form.set("email", "jane");
    await editor.form.submit();
    expect(fetch).not.toHaveBeenCalled();
    expect(editor.form.field("name").error).toBeDefined();
    expect(editor.form.field("role").error).toBeDefined();
    expect(editor.form.field("email").error).toBeDefined();
    expect(editor.form.field("phone").error).toBeUndefined();
    expect(editor.error.value).toBeNull();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("refuses a phone number that is not one, as the field is left and on a save", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const editor = useStaffEditor(STAFF);
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
    const changed = { ...STAFF, phone: "530-555-0100" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const editor = useStaffEditor(STAFF);
    editor.form.set("phone", "(530) 555-0100");
    expect(editor.form.check("phone")).toBe(true);
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", {
      method: "PUT",
      body: { ...BODY, phone: "530-555-0100" },
    });
    expect(editor.form.payload.phone).toBe("530-555-0100");
  });

  it("writes no phone number once the field is cleared", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const editor = useStaffEditor({ ...STAFF, phone: "530-555-0100" });
    editor.form.set("phone", "");
    expect(editor.form.payload.phone).toBeUndefined();
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", {
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
    const editor = useStaffEditor(STAFF);
    await expect(editor.form.submit()).rejects.toThrow("The server is away.");
    expect(editor.error.value).toBe("The server is away.");
    expect(editor.form.submitting).toBe(false);
    expect(editor.form.submitted).toBe(false);
    expect(useRouter().push).not.toHaveBeenCalled();

    editor.form.set("email", "jane");
    await editor.form.submit();
    expect(editor.error.value).toBeNull();
  });

  it("is clean on the record as it was saved, and dirty from the first change", () => {
    const editor = useStaffEditor(STAFF);
    expect(editor.dirty.value).toBe(false);
    expect(editor.saving.value).toBe(false);
    editor.form.set("name", "Jane Roe");
    expect(editor.dirty.value).toBe(true);
  });

  it("saves for the page that saves the whole record, and is clean again", async () => {
    const changed = { ...STAFF, name: "Jane Roe" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const saved = vi.fn();
    const editor = useStaffEditor(STAFF, saved);
    editor.form.set("name", "Jane Roe");
    await editor.save();
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", {
      method: "PUT",
      body: expect.objectContaining({ name: "Jane Roe" }),
    });
    expect(saved).toHaveBeenCalledWith(changed);
    expect(editor.dirty.value).toBe(false);
    expect(editor.error.value).toBeNull();
  });

  it("puts the fields back as they were last saved on a reset, with what was wrong", async () => {
    const editor = useStaffEditor(STAFF);
    editor.form.set("email", "jane");
    await editor.save();
    expect(editor.form.valid).toBe(false);
    expect(editor.dirty.value).toBe(true);
    editor.reset();
    expect(editor.form.payload.name).toBe("Jane Doe");
    expect(editor.form.errors).toEqual({});
    expect(editor.dirty.value).toBe(false);

    const changed = { ...STAFF, name: "Jane Roe" };
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => changed),
    );
    editor.form.set("name", "Jane Roe");
    await editor.save();
    editor.form.set("name", "Another Slip");
    editor.reset();
    expect(editor.form.payload.name).toBe("Jane Roe");
  });

  it("saves without throwing: what fails reports through the error, which a reset clears", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const editor = useStaffEditor(STAFF);
    editor.form.set("name", "Jane Roe");
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
    const editor = useStaffEditor(STAFF);
    editor.form.set("name", "Jane Roe");
    const saving = editor.save();
    expect(editor.saving.value).toBe(true);
    editor.reset();
    expect(editor.form.payload.name).toBe("Jane Roe");
    answer({ ...STAFF, name: "Jane Roe" });
    await saving;
    expect(editor.saving.value).toBe(false);
  });
});
