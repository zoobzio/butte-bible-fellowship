import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

import { navigateTo } from "#imports";
import { PERSON } from "#test/support/records";
import { withSetup } from "@bbf/nuxt/testing/mount";
import { usePeopleTable } from "~/composables/people/table";
import { usePeopleRequests } from "~/composables/people/tasks";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";

/** The day it is at the church, as the search offers it. */
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  dateStyle: "short",
}).format(new Date());

describe("usePeopleTable", () => {
  it("is the people table, in the church's time zone, its columns and its search named by the prose, the name the way to a person's editor", () => {
    const table = withSetup(() => usePeopleTable()).result;
    expect(table.id).toBe("people");
    expect(table.table.getRowId(PERSON, 0)).toBe("1");
    expect(table.timeZone).toBe(TIME_ZONE);
    expect(table.can("search")).toBe(true);
    const columns = table.table.getAllLeafColumns();
    expect(columns[0]?.columnDef.meta?.link?.(PERSON)).toBe(
      "/people/1/profile",
    );
    expect(
      columns.slice(1).every((column) => !column.columnDef.meta?.link),
    ).toBe(true);
    expect(columns.map((column) => column.columnDef.meta?.label)).toEqual([
      "Name",
      "Role",
      "Title",
      "Email",
      "Phone",
      "Summary",
      "Address",
      "Birthday",
      "Photo URL",
      "Updated",
      "Created",
    ]);
    expect(table.query.literals).toEqual({
      text: { label: "Search", open: '"', close: '"' },
    });
    expect(columns.map((column) => column.id)).toEqual([
      "name",
      "role",
      "title",
      "email",
      "phone",
      "summary",
      "address",
      "birthday",
      "photo",
      "updatedAt",
      "createdAt",
    ]);
    expect(
      table.table.getVisibleLeafColumns().map((column) => column.id),
    ).toEqual(["name", "role", "email", "phone", "updatedAt"]);
    expect(Object.keys(table.query.fields)).toEqual([
      "name",
      "role",
      "title",
      "email",
      "phone",
      "summary",
      "address",
      "photo",
      "updatedAt",
      "createdAt",
    ]);
    expect(
      columns
        .filter((column) => column.getCanSort())
        .map((column) => column.id),
    ).toEqual([
      "name",
      "role",
      "title",
      "email",
      "phone",
      "birthday",
      "updatedAt",
      "createdAt",
    ]);
    expect(columns.every((column) => !column.getCanMultiSort())).toBe(true);
    expect(
      columns
        .filter((column) => !column.getCanHide())
        .map((column) => column.id),
    ).toEqual(["name"]);
  });

  it("offers each date filter the days the term names, today first before one is typed, each way of a span its own filter", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { query } = withSetup(() => usePeopleTable()).result;
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

  it("offers the role held or not, a bare value the one held, and no status", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { query } = withSetup(() => usePeopleTable()).result;
    expect(query.fields.role?.operators).toEqual(["is", "not"]);
    expect(query.fields.role?.values).toEqual([
      "pastor",
      "elder",
      "staff",
      "member",
    ]);
    expect(query.fields.status).toBeUndefined();
    query.setDraft("Role: not pastor");
    query.submit();
    query.add({ kind: "filter", key: "role", value: "elder" });
    expect(query.filters).toEqual([
      { key: "role", op: "not", value: "pastor" },
      { key: "role", op: "is", value: "elder" },
    ]);
  });

  it("offers each text column the text it holds, carries, starts or ends with, a bare value the one carried, and an optional one present or missing", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { query } = withSetup(() => usePeopleTable()).result;
    for (const key of [
      "name",
      "title",
      "email",
      "phone",
      "summary",
      "address",
      "photo",
    ]) {
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
    for (const key of [
      "title",
      "email",
      "phone",
      "summary",
      "address",
      "photo",
    ]) {
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

  it("fetches a page of the people from the admin's API", async () => {
    const fetch = vi.fn(async () => ({ items: [PERSON], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => usePeopleTable()).result;
    await table.fetch();
    expect(fetch).toHaveBeenCalledWith("/api/people", {
      query: { page: 1, size: 25 },
    });
    expect(table.data).toEqual([PERSON]);
    expect(table.rowCount).toBe(1);
    expect(table.table.getPageCount()).toBe(1);
  });

  it("searches the people by the text and the filters the search box commits, from the first page", async () => {
    const fetch = vi.fn(async () => ({ items: [PERSON], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => usePeopleTable()).result;
    table.table.setPageIndex(1);
    await flushPromises();
    table.query.add({ kind: "literal", key: "text", value: "jane" });
    table.query.add({ kind: "filter", key: "role", value: "elder" });
    table.query.add({
      kind: "filter",
      key: "role",
      op: "not",
      value: "pastor",
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
    expect(fetch).toHaveBeenLastCalledWith("/api/people", {
      query: {
        page: 1,
        size: 25,
        q: "jane",
        roleIs: "elder",
        roleNot: "pastor",
        photoIs: "missing",
        nameStartsWith: "J",
        emailContains: "example",
        updatedAtAfter: "2026-10-01",
        createdAtOnOrBefore: "2026-10-31",
      },
    });
  });

  it("sorts the people by a column on the page it is on, the other way on a second ask, and not at all on a third", async () => {
    const fetch = vi.fn(async () => ({ items: [PERSON], total: 60 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => usePeopleTable()).result;
    await table.fetch();
    table.table.setPageIndex(1);
    const updated = table.table.getColumn("updatedAt")!;
    updated.toggleSorting();
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/people", {
      query: { page: 2, size: 25, sort: "updatedAt", direction: "asc" },
    });
    updated.toggleSorting();
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/people", {
      query: { page: 2, size: 25, sort: "updatedAt", direction: "desc" },
    });
    updated.toggleSorting();
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/people", {
      query: { page: 2, size: 25 },
    });
  });

  it("sorts by one column at a time: a second column sorted takes the first's place", async () => {
    const fetch = vi.fn(async () => ({ items: [PERSON], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => usePeopleTable()).result;
    table.table.getColumn("name")!.toggleSorting(false, true);
    table.table.getColumn("role")!.toggleSorting(true, true);
    await flushPromises();
    expect(table.snapshot().sorting).toEqual([{ id: "role", desc: true }]);
    expect(fetch).toHaveBeenLastCalledWith("/api/people", {
      query: { page: 1, size: 25, sort: "role", direction: "desc" },
    });
  });

  it("offers an edit of each row that opens the person's editor", () => {
    const [edit] = withSetup(() => usePeopleTable()).result.actions;
    expect(edit?.label).toBe("Edit");
    edit?.action(PERSON);
    expect(navigateTo).toHaveBeenCalledWith("/people/1/profile");
  });

  it("lets its rows select, and leaves the removal of the ones selected for the people page", () => {
    const table = withSetup(() => usePeopleTable()).result;
    expect(table.table.options.enableRowSelection).toBe(true);
    const [remove] = table.bulkActions;
    expect(remove?.label).toBe("Delete");
    expect(usePeopleRequests().value.removing).toBeNull();
    remove?.action(["1", "2"]);
    expect(usePeopleRequests().value.removing).toEqual(["1", "2"]);
  });
});
