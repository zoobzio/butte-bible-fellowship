import { describe, expect, it, vi } from "vitest";

import { useRouter } from "#imports";
import { BIO, STAFF } from "#test/support/records";
import { useStaffEditor } from "~/composables/staff/editor";

describe("useStaffEditor", () => {
  const BODY = {
    name: "Jane Doe",
    role: "elder",
    summary: "Has served since 2010.",
    bio: BIO,
    email: "jane@example.com",
    status: "published",
  };

  it("is the staff form, blank for a new member: a draft, with no role, and no delete", () => {
    const editor = useStaffEditor(null);
    expect(editor.form.id).toBe("staff");
    expect(editor.form.config.fields.map((field) => field.key)).toEqual([
      "name",
      "role",
      "status",
      "photo",
      "email",
      "phone",
      "summary",
      "bio",
    ]);
    expect(editor.form.payload).toEqual({ status: "draft" });
    expect(editor.removable).toBe(false);
  });

  it("opens on a member's record, the bio as HTML, with a delete", () => {
    const editor = useStaffEditor(STAFF);
    expect(editor.form.payload).toEqual({
      ...BODY,
      bio: "<p>Has served since 2010.</p>",
    });
    expect(editor.removable).toBe(true);
  });

  it("starts over from the record, whatever the last visit left", () => {
    useStaffEditor(STAFF).form.set("name", "Someone Else");
    expect(useStaffEditor(null).form.payload).toEqual({ status: "draft" });
    expect(useStaffEditor(STAFF).form.payload.name).toBe("Jane Doe");
  });

  it("offers each role and each status by name", () => {
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
    expect(options("status")).toEqual([
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
    ]);
  });

  it("creates a member from what is written, and leaves for the list", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const editor = useStaffEditor(null);
    editor.form.set("name", " John Roe ");
    editor.form.set("role", "staff");
    editor.form.set("email", "");
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      method: "POST",
      body: { name: "John Roe", role: "staff", status: "draft" },
    });
    expect(useRouter().push).toHaveBeenCalledWith("/staff");
    expect(editor.form.submitted).toBe(true);
    expect(editor.error.value).toBeNull();
  });

  it("replaces the member when there is a record, the bio as the tree the app renders", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const editor = useStaffEditor(STAFF);
    editor.form.set("role", "pastor");
    editor.form.set("bio", "<p>Since 2010.</p>");
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", {
      method: "PUT",
      body: {
        ...BODY,
        role: "pastor",
        bio: {
          type: "root",
          children: [
            {
              type: "element",
              tagName: "p",
              properties: {},
              children: [{ type: "text", value: "Since 2010." }],
            },
          ],
        },
      },
    });
  });

  it("writes no bio once the editor is emptied", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const editor = useStaffEditor(STAFF);
    editor.form.set("bio", "");
    expect(editor.form.payload.bio).toBeUndefined();
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", {
      method: "PUT",
      body: { ...BODY, bio: undefined },
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

  it("deletes the member, once asked by name", async () => {
    const fetch = vi.fn(async () => null);
    vi.stubGlobal("$fetch", fetch);
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    await useStaffEditor(STAFF).destroy();
    expect(confirm).toHaveBeenCalledWith(
      "Delete Jane Doe? This cannot be undone.",
    );
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", { method: "DELETE" });
    expect(useRouter().push).toHaveBeenCalledWith("/staff");
  });

  it("keeps the member when the question is declined, or there is none", async () => {
    const fetch = vi.fn(async () => null);
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => false);
    await useStaffEditor(STAFF).destroy();
    await useStaffEditor(null).destroy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("says what went wrong when the deletion fails", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    vi.stubGlobal("confirm", () => true);
    const editor = useStaffEditor(STAFF);
    await editor.destroy();
    expect(editor.error.value).toBe("The server is away.");
    expect(editor.removing.value).toBe(false);
    expect(useRouter().push).not.toHaveBeenCalled();
  });
});
