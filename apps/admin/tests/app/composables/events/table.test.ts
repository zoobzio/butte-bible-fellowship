import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

import { navigateTo } from "#imports";
import { DINNER, WORSHIP } from "#test/support/records";
import { withSetup } from "@bbf/nuxt/testing/mount";
import { useEventsTable } from "~/composables/events/table";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";

const TEXT_OPERATORS = [
  "contains",
  "not contains",
  "starts with",
  "ends with",
  "is",
  "not",
];

const DAY_OPERATORS = ["before", "after", "on", "on or after", "on or before"];

describe("useEventsTable", () => {
  it("is the events table, in the church's time zone, its columns and its search named by the prose, the title the way to an event's details", () => {
    const table = withSetup(() => useEventsTable()).result;
    expect(table.id).toBe("events");
    expect(table.rowKey).toBe("id");
    expect(table.timeZone).toBe(TIME_ZONE);
    expect(table.searchable).toBe(true);
    expect(table.columns[0]?.link?.(DINNER)).toBe("/events/4/details");
    expect(table.columns.slice(1).every((column) => !column.link)).toBe(true);
    expect(table.columns.map((column) => column.label)).toEqual([
      "Title",
      "Day",
      "Date",
      "Repeats weekly",
      "Start",
      "End",
      "Slug",
      "Summary",
      "Image URL",
      "Updated",
      "Created",
    ]);
    expect(table.query.literals).toEqual({
      text: { label: "Search", open: '"', close: '"' },
    });
    expect(table.columns.map((column) => column.key)).toEqual([
      "title",
      "day",
      "date",
      "recurring",
      "start",
      "end",
      "slug",
      "summary",
      "image",
      "updatedAt",
      "createdAt",
    ]);
    expect(table.visibleColumns.map((column) => column.key)).toEqual([
      "title",
      "day",
      "date",
      "recurring",
      "start",
      "updatedAt",
    ]);
    expect(table.filterableColumns.map((column) => column.key)).toEqual([
      "title",
      "day",
      "date",
      "recurring",
      "slug",
      "summary",
      "image",
      "updatedAt",
      "createdAt",
    ]);
    expect(
      table.columns
        .filter((column) => column.sortable)
        .map((column) => column.key),
    ).toEqual([
      "title",
      "day",
      "date",
      "recurring",
      "start",
      "slug",
      "updatedAt",
      "createdAt",
    ]);
    expect(table.isColumnPinned("title")).toBe(true);
  });

  it("offers whether an event recurs and its day held or not, a bare value the one held, and no status", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { query } = withSetup(() => useEventsTable()).result;
    const recurring = query.fields.recurring!;
    expect(recurring.operators).toEqual(["is", "not"]);
    expect(recurring.values).toEqual(["true", "false"]);
    expect(query.fields.day?.operators).toEqual(["is", "not"]);
    expect(query.fields.day?.values).toHaveLength(7);
    expect(query.fields.status).toBeUndefined();
    query.setDraft(`${recurring.label}: not true`);
    query.submit();
    query.add({ kind: "filter", key: "day", value: "sunday" });
    expect(query.filters).toEqual([
      { key: "recurring", op: "not", value: "true" },
      { key: "day", op: "is", value: "sunday" },
    ]);
  });

  it("offers each text column the text it holds, carries, starts or ends with, and an optional one present or missing", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { query } = withSetup(() => useEventsTable()).result;
    for (const key of ["title", "slug", "summary", "image"]) {
      expect(query.fields[key]?.operators, key).toEqual(TEXT_OPERATORS);
    }
    // The title and the slug are never empty, so they offer no presence.
    expect(query.fields.title?.values).toBeUndefined();
    expect(query.fields.slug?.values).toBeUndefined();
    for (const key of ["summary", "image"]) {
      expect(query.fields[key]?.values, key).toEqual(["present", "missing"]);
    }
    // The times are shown and sorted by, and filtered by nothing; a note
    // and a location are no longer an event's to filter by.
    for (const key of ["start", "end", "note", "location"]) {
      expect(query.fields[key], key).toBeUndefined();
    }
    query.setDraft("Title: worship");
    query.submit();
    query.setDraft("Summary: is missing");
    query.submit();
    expect(query.filters).toEqual([
      { key: "title", op: "contains", value: "worship" },
      { key: "summary", op: "is", value: "missing" },
    ]);
  });

  it("offers the date held and the days changed and added each way of a span, a bare day the one it is on", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { query } = withSetup(() => useEventsTable()).result;
    for (const key of ["date", "updatedAt", "createdAt"]) {
      expect(query.fields[key]?.operators, key).toEqual(DAY_OPERATORS);
    }
    query.setDraft("Date: on or after 2026-12-01");
    expect(query.stage).toBe("value");
    query.submit();
    query.setDraft("Date: on or before 2026-12-31");
    query.submit();
    expect(query.filters).toEqual([
      { key: "date", op: "on or after", value: "2026-12-01" },
      { key: "date", op: "on or before", value: "2026-12-31" },
    ]);
  });

  it("fetches a page of the events from the admin's API", async () => {
    const fetch = vi.fn(async () => ({ items: [WORSHIP, DINNER], total: 2 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => useEventsTable()).result;
    await table.fetch();
    expect(fetch).toHaveBeenCalledWith("/api/events", {
      query: { page: 1, size: 25 },
    });
    expect(table.data).toEqual([WORSHIP, DINNER]);
    expect(table.total).toBe(2);
    expect(table.pageCount).toBe(1);
  });

  it("searches the events by the text and the filters the search box commits, from the first page, as the API names each", async () => {
    const fetch = vi.fn(async () => ({ items: [DINNER], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => useEventsTable()).result;
    table.goToPage(2);
    table.query.add({ kind: "literal", key: "text", value: "dinner" });
    table.query.add({ kind: "filter", key: "recurring", value: "false" });
    table.query.add({ kind: "filter", key: "day", op: "not", value: "sunday" });
    table.query.add({
      kind: "filter",
      key: "image",
      op: "is",
      value: "present",
    });
    table.query.add({
      kind: "filter",
      key: "slug",
      op: "starts with",
      value: "harvest",
    });
    table.query.add({ kind: "filter", key: "title", value: "dinner" });
    table.query.add({
      kind: "filter",
      key: "date",
      op: "on or after",
      value: "2026-10-01",
    });
    table.query.add({
      kind: "filter",
      key: "updatedAt",
      op: "before",
      value: "2026-10-31",
    });
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/events", {
      query: {
        page: 1,
        size: 25,
        q: "dinner",
        recurringIs: "false",
        dayNot: "sunday",
        imageIs: "present",
        slugStartsWith: "harvest",
        titleContains: "dinner",
        dateOnOrAfter: "2026-10-01",
        updatedAtBefore: "2026-10-31",
      },
    });
  });

  it("sorts the events by a column the API sorts by, under the key it names", async () => {
    const fetch = vi.fn(async () => ({ items: [DINNER], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => useEventsTable()).result;
    table.goToPage(2);
    table.sortBy("start");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/events", {
      query: { page: 1, size: 25, sort: "start", direction: "asc" },
    });
    table.sortBy("start");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/events", {
      query: { page: 1, size: 25, sort: "start", direction: "desc" },
    });
  });

  it("asks the API for nothing its query refuses", async () => {
    const { EVENT_SORT_KEYS, eventQuery } = await import("@bbf/schema");
    const table = withSetup(() => useEventsTable()).result;
    expect(
      table.columns
        .filter((column) => column.sortable)
        .map((column) => column.key)
        .sort(),
    ).toEqual([...EVENT_SORT_KEYS].sort());
    const keys = Object.keys(eventQuery.shape);
    for (const column of table.filterableColumns) {
      expect(
        keys.some((key) => key.startsWith(String(column.key))),
        String(column.key),
      ).toBe(true);
    }
  });

  it("offers an edit of each row that opens the event's details", () => {
    const [edit] = withSetup(() => useEventsTable()).result.actions;
    expect(edit?.label).toBe("Edit");
    edit?.action(WORSHIP);
    expect(navigateTo).toHaveBeenCalledWith("/events/3/details");
  });
});
