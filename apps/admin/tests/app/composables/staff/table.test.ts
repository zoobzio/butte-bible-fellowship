import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

import { navigateTo } from "#imports";
import { STAFF } from "#test/support/records";
import { withSetup } from "@bbf/nuxt/testing/mount";
import { useStaffTable } from "~/composables/staff/table";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";

/** The day it is at the church, as the search offers it. */
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  dateStyle: "short",
}).format(new Date());

describe("useStaffTable", () => {
  it("is the staff table, in the church's time zone, its columns and its search named by the prose, the name the way to a member's editor", () => {
    const table = withSetup(() => useStaffTable()).result;
    expect(table.id).toBe("staff");
    expect(table.rowKey).toBe("id");
    expect(table.timeZone).toBe(TIME_ZONE);
    expect(table.searchable).toBe(true);
    expect(table.columns[0]?.link?.(STAFF)).toBe("/staff/1");
    expect(table.columns.slice(1).every((column) => !column.link)).toBe(true);
    expect(table.columns.map((column) => column.label)).toEqual([
      "Name",
      "Role",
      "Status",
      "Email",
      "Phone",
      "Summary",
      "Photo URL",
      "Updated",
      "Created",
    ]);
    expect(table.query.literals).toEqual({
      text: { label: "Search", open: '"', close: '"' },
    });
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
  });

  it("offers each date filter the days the term names, today first before one is typed, each way of a span its own filter", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { query } = withSetup(() => useStaffTable()).result;
    // Nothing typed: the table's own recent window, a month, today first.
    for (const label of ["Updated", "Created"]) {
      query.setDraft(`${label}: on `);
      expect(query.stage).toBe("value");
      expect(query.items).toHaveLength(31);
      expect(query.items[0]?.value).toBe(today);
    }
    // A partial year narrows that window, and completes to today.
    query.setDraft(`Updated: on ${today.slice(0, 1)}`);
    expect(query.hint).toBe(today.slice(1));
    // A month names its days, newest first, whenever it falls.
    query.setDraft("Updated: on 2024-02");
    expect(query.stage).toBe("value");
    expect(query.items).toHaveLength(29);
    expect(query.items[0]?.value).toBe("2024-02-29");
    expect(query.hint).toBe("-29");
    query.setDraft(`Updated: on ${today}`);
    query.submit();
    expect(query.filters).toEqual([
      { key: "updatedAt", op: "on", value: today },
    ]);
    // An older day is offered as typed, and taken.
    query.setDraft("Created: before 2019-05-04");
    expect(query.items.map((item) => item.value)).toEqual(["2019-05-04"]);
    query.submit();
    expect(query.filters).toContainEqual({
      key: "createdAt",
      op: "before",
      value: "2019-05-04",
    });
    expect(query.fields.updatedAt?.operators).toEqual([
      "before",
      "after",
      "on",
      "on or after",
      "on or before",
    ]);
    // A span is a filter each way, both held: the longer operator is read
    // whole, not as on with a value of its own.
    query.setDraft("Updated: on or after 2026-10-01");
    expect(query.stage).toBe("value");
    query.submit();
    query.setDraft("Updated: on or before 2026-10-31");
    query.submit();
    expect(query.filters).toEqual(
      expect.arrayContaining([
        { key: "updatedAt", op: "on", value: today },
        { key: "updatedAt", op: "on or after", value: "2026-10-01" },
        { key: "updatedAt", op: "on or before", value: "2026-10-31" },
      ]),
    );
  });

  it("offers the role and the status held or not, a bare value the one held", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { query } = withSetup(() => useStaffTable()).result;
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
  });

  it("offers each text column the text it holds, carries, starts or ends with, a bare value the one carried, and an optional one present or missing", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { query } = withSetup(() => useStaffTable()).result;
    for (const key of ["name", "email", "phone", "summary", "photo"]) {
      expect(query.fields[key]?.operators).toEqual([
        "contains",
        "not contains",
        "starts with",
        "ends with",
        "is",
        "not",
      ]);
    }
    // The name is never empty, so it offers no presence; the rest do.
    expect(query.fields.name?.values).toBeUndefined();
    for (const key of ["email", "phone", "summary", "photo"]) {
      expect(query.fields[key]?.values).toEqual(["present", "missing"]);
    }
    query.setDraft("Name: jane");
    expect(query.stage).toBe("op");
    query.submit();
    expect(query.filters).toEqual([
      { key: "name", op: "contains", value: "jane" },
    ]);
    // A longer operator is read whole, not as the shorter it starts with.
    query.setDraft("Name: not contains doe");
    expect(query.stage).toBe("value");
    query.submit();
    query.setDraft("Name: starts with J");
    query.submit();
    query.setDraft("Email: ends with @example.com");
    query.submit();
    query.setDraft("Phone: not 530-555-0100");
    query.submit();
    const photo = query.fields.photo!.label;
    query.setDraft(`${photo}: is mis`);
    expect(query.hint).toBe("sing");
    query.setDraft(`${photo}: is missing`);
    query.submit();
    expect(query.filters).toEqual([
      { key: "name", op: "contains", value: "jane" },
      { key: "name", op: "not contains", value: "doe" },
      { key: "name", op: "starts with", value: "J" },
      { key: "email", op: "ends with", value: "@example.com" },
      { key: "phone", op: "not", value: "530-555-0100" },
      { key: "photo", op: "is", value: "missing" },
    ]);
  });

  it("fetches a page of the staff from the admin's API", async () => {
    const fetch = vi.fn(async () => ({ items: [STAFF], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => useStaffTable()).result;
    await table.fetch();
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      query: { page: 1, size: 25 },
    });
    expect(table.data).toEqual([STAFF]);
    expect(table.total).toBe(1);
    expect(table.pageCount).toBe(1);
  });

  it("searches the staff by the text and the filters the search box commits, from the first page", async () => {
    const fetch = vi.fn(async () => ({ items: [STAFF], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => useStaffTable()).result;
    table.goToPage(2);
    table.query.add({ kind: "literal", key: "text", value: "jane" });
    table.query.add({ kind: "filter", key: "role", value: "elder" });
    table.query.add({
      kind: "filter",
      key: "status",
      op: "not",
      value: "archived",
    });
    table.query.add({
      kind: "filter",
      key: "photo",
      op: "is",
      value: "missing",
    });
    table.query.add({
      kind: "filter",
      key: "name",
      op: "starts with",
      value: "J",
    });
    table.query.add({ kind: "filter", key: "email", value: "example" });
    table.query.add({
      kind: "filter",
      key: "updatedAt",
      op: "after",
      value: "2026-10-01",
    });
    table.query.add({
      kind: "filter",
      key: "createdAt",
      op: "on or before",
      value: "2026-10-31",
    });
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/staff", {
      query: {
        page: 1,
        size: 25,
        q: "jane",
        roleIs: "elder",
        statusNot: "archived",
        photoIs: "missing",
        nameStartsWith: "J",
        emailContains: "example",
        updatedAtAfter: "2026-10-01",
        createdAtOnOrBefore: "2026-10-31",
      },
    });
  });

  it("sorts the staff by a column, from the first page, and the other way on a second ask", async () => {
    const fetch = vi.fn(async () => ({ items: [STAFF], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => useStaffTable()).result;
    table.goToPage(2);
    table.sortBy("updatedAt");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/staff", {
      query: { page: 1, size: 25, sort: "updatedAt", direction: "asc" },
    });
    table.sortBy("updatedAt");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/staff", {
      query: { page: 1, size: 25, sort: "updatedAt", direction: "desc" },
    });
  });

  it("offers an edit of each row that opens the member's editor", () => {
    const [edit] = withSetup(() => useStaffTable()).result.actions;
    expect(edit?.label).toBe("Edit");
    edit?.action(STAFF);
    expect(navigateTo).toHaveBeenCalledWith("/staff/1");
  });
});
