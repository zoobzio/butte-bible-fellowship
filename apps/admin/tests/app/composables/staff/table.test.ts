import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

import { navigateTo } from "#imports";
import { STAFF } from "#test/support/records";
import { withSetup } from "@bbf/nuxt/testing/mount";
import { useStaffTable } from "~/composables/staff/table";
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
      "email",
      "phone",
      "summary",
      "photo",
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
    query.setDraft(`Updated: on ${today!.slice(0, 7)}`);
    expect(query.stage).toBe("value");
    expect(query.items.length).toBeGreaterThan(0);
    expect(query.items.length).toBeLessThanOrEqual(31);
    expect(query.hint).toBe(today!.slice(7));
    query.setDraft(`Updated: on ${today}`);
    query.submit();
    expect(query.filters).toEqual([
      { key: "updatedAt", op: "on", value: today },
    ]);
    // An older day is not offered, and is taken as typed all the same.
    query.setDraft("Created: before 2019-05-04");
    expect(query.items).toEqual([]);
    query.submit();
    expect(query.filters).toContainEqual({
      key: "createdAt",
      op: "before",
      value: "2019-05-04",
    });
  });

  it("offers the role and the status held or not, a bare value the one held, and each optional column present or missing", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { result } = withSetup(() => useStaffTable());
    const { query } = result.table;
    expect(query.fields.role?.operators).toEqual(["is", "not"]);
    expect(query.fields.status?.values).toEqual([
      "draft",
      "published",
      "archived",
    ]);
    query.setDraft("Status: not archived");
    query.submit();
    query.add({ kind: "filter", key: "role", value: "elder" });
    expect(query.filters).toEqual([
      { key: "status", op: "not", value: "archived" },
      { key: "role", op: "is", value: "elder" },
    ]);
    for (const key of ["email", "phone", "summary", "photo"]) {
      expect(query.fields[key]?.operators).toBeUndefined();
      expect(query.fields[key]?.values).toEqual(["present", "missing"]);
    }
    const photo = query.fields.photo!.label;
    query.setDraft(`${photo}: mis`);
    expect(query.hint).toBe("sing");
    query.setDraft(`${photo}: missing`);
    query.submit();
    expect(query.filters).toContainEqual({ key: "photo", value: "missing" });
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
      key: "status",
      op: "not",
      value: "archived",
    });
    result.table.query.add({ kind: "filter", key: "photo", value: "missing" });
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
        roleIs: "elder",
        statusNot: "archived",
        photo: "missing",
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
