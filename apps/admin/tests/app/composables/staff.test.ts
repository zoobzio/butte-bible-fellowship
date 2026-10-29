import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

import { navigateTo, useRouter } from "#imports";
import { BIO, STAFF } from "#test/support/records";
import { withSetup } from "@bbf/nuxt/testing/mount";
import {
  useStaffEditor,
  useStaffRecord,
  useStaffTable,
} from "~/composables/staff";
import { FILTER_DAYS } from "~/constants/listing";
import { recentDays } from "~/utils/listing";

describe("useStaffTable", () => {
  it("is the staff table, the name the way to a member's editor", () => {
    const { result } = withSetup(() => useStaffTable());
    const { table, link } = result;
    expect(table.id).toBe("staff");
    expect(table.rowKey).toBe("id");
    expect(table.searchable).toBe(true);
    expect(table.columns.map((column) => column.key)).toEqual([
      "name",
      "role",
      "status",
      "email",
      "phone",
      "summary",
      "photo",
      "updatedAt",
      "createdAt",
    ]);
    expect(table.visibleColumns.map((column) => column.key)).toEqual([
      "name",
      "role",
      "status",
      "email",
      "phone",
      "updatedAt",
    ]);
    expect(table.filterableColumns.map((column) => column.key)).toEqual([
      "role",
      "status",
      "updatedAt",
      "createdAt",
    ]);
    expect(
      table.columns
        .filter((column) => column.sortable)
        .map((column) => column.key),
    ).toEqual([
      "name",
      "role",
      "status",
      "email",
      "phone",
      "updatedAt",
      "createdAt",
    ]);
    expect(table.isColumnPinned("name")).toBe(true);
    expect(link(STAFF)).toBe("/staff/1");
  });

  it("offers a month of days to each date filter, today first, and completes the one typed", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { result } = withSetup(() => useStaffTable());
    const { query } = result.table;
    const [today] = recentDays(1);
    for (const key of ["updatedAt", "createdAt"]) {
      expect(query.fields[key]?.values).toHaveLength(FILTER_DAYS);
      expect(query.fields[key]?.values?.[0]).toBe(today);
    }
    query.setDraft(`Updated: on: ${today!.slice(0, 7)}`);
    expect(query.stage).toBe("value");
    expect(query.items.length).toBeGreaterThan(0);
    expect(query.items.length).toBeLessThanOrEqual(31);
    expect(query.hint).toBe(today!.slice(7));
    query.setDraft(`Updated: on: ${today}`);
    query.submit();
    expect(query.filters).toEqual([
      { key: "updatedAt", op: "on", value: today },
    ]);
    // An older day is not offered, and is taken as typed all the same.
    query.setDraft("Created: before: 2019-05-04");
    expect(query.items).toEqual([]);
    query.submit();
    expect(query.filters).toContainEqual({
      key: "createdAt",
      op: "before",
      value: "2019-05-04",
    });
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

  it("searches the staff by the text and the filters the search box commits, from the first page", async () => {
    const fetch = vi.fn(async () => ({ items: [STAFF], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const { result } = withSetup(() => useStaffTable());
    result.table.goToPage(2);
    result.table.query.add({ kind: "text", value: "jane" });
    result.table.query.add({ kind: "filter", key: "role", value: "elder" });
    result.table.query.add({
      kind: "filter",
      key: "updatedAt",
      op: "after",
      value: "2026-10-01",
    });
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/staff", {
      query: {
        page: 1,
        size: 25,
        q: "jane",
        role: "elder",
        updatedAtAfter: "2026-10-01",
      },
    });
  });

  it("sorts the staff by a column, from the first page, and the other way on a second ask", async () => {
    const fetch = vi.fn(async () => ({ items: [STAFF], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const { result } = withSetup(() => useStaffTable());
    result.table.goToPage(2);
    result.table.sortBy("updatedAt");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/staff", {
      query: { page: 1, size: 25, sort: "updatedAt", direction: "asc" },
    });
    result.table.sortBy("updatedAt");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/staff", {
      query: { page: 1, size: 25, sort: "updatedAt", direction: "desc" },
    });
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
