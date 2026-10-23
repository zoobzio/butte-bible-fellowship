import { describe, expect, it, vi } from "vitest";

import { navigateTo, useRouter } from "#imports";
import { STAFF } from "#test/support/records";
import { withSetup } from "#test/support/mount";
import {
  useStaffEditor,
  useStaffRecord,
  useStaffTable,
} from "~/composables/staff";

describe("useStaffTable", () => {
  it("is the staff table, the name the way to a member's editor", () => {
    const { result } = withSetup(() => useStaffTable());
    const { table, link } = result;
    expect(table.id).toBe("staff");
    expect(table.rowKey).toBe("id");
    expect(table.searchable).toBe(false);
    expect(table.columns.map((column) => column.key)).toEqual([
      "name",
      "role",
      "position",
      "status",
      "updatedAt",
    ]);
    expect(table.isColumnPinned("name")).toBe(true);
    expect(link(STAFF)).toBe("/staff/1");
  });

  it("fetches a page of the staff from the admin's API", async () => {
    const fetch = vi.fn(async () => ({ items: [STAFF], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const { result } = withSetup(() => useStaffTable());
    await result.table.fetch();
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      query: { page: 1, size: 25 },
    });
    expect(result.table.data).toEqual([STAFF]);
    expect(result.table.total).toBe(1);
    expect(result.table.pageCount).toBe(1);
  });

  it("offers an edit of each row that opens the member's editor", () => {
    const { result } = withSetup(() => useStaffTable());
    const [edit] = result.table.actions;
    expect(edit?.label).toBe("Edit");
    edit?.action(STAFF);
    expect(navigateTo).toHaveBeenCalledWith("/staff/1");
  });
});

describe("useStaffRecord", () => {
  it("reads the member the route names from the admin's API", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const { setRoutePath } = await import("#imports");
    setRoutePath("/staff/1", { id: "1" });
    expect((await useStaffRecord()).data.value).toEqual(STAFF);
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", {});
  });
});

describe("useStaffEditor", () => {
  it("creates a member when there is no record, and leaves for the list", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const editor = useStaffEditor(null);
    expect(editor.removable).toBe(false);
    editor.draft.slug = "john-roe";
    editor.draft.name = "John Roe";
    editor.draft.role = "Deacon";
    await editor.submit();
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      method: "POST",
      body: {
        slug: "john-roe",
        name: "John Roe",
        role: "Deacon",
        position: 0,
        status: "draft",
      },
    });
    expect(useRouter().push).toHaveBeenCalledWith("/staff");
  });

  it("replaces the member when there is a record", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const editor = useStaffEditor(STAFF);
    expect(editor.removable).toBe(true);
    editor.draft.role = "Pastor";
    await editor.submit();
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", {
      method: "PUT",
      body: expect.objectContaining({ slug: "jane-doe", role: "Pastor" }),
    });
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

  it("keeps the editor open with what is wrong with the draft", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const editor = useStaffEditor(null);
    await editor.submit();
    expect(fetch).not.toHaveBeenCalled();
    expect(editor.error.value).toContain("slug:");
  });
});
