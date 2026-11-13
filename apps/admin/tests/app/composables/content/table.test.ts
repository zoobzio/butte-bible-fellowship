import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

import { navigateTo } from "#imports";
import { HOME, ABOUT } from "#test/support/records";
import { withSetup } from "@bbf/nuxt/testing/mount";
import { useContentTable } from "~/composables/content/table";
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

describe("useContentTable", () => {
  it("is the content table, in the church's time zone, its columns and its search named by the prose, the title the way to a page's editor", () => {
    const table = withSetup(() => useContentTable()).result;
    expect(table.id).toBe("content");
    expect(table.rowKey).toBe("id");
    expect(table.timeZone).toBe(TIME_ZONE);
    expect(table.searchable).toBe(true);
    expect(table.columns[0]?.link?.(ABOUT)).toBe("/content/6/page");
    expect(table.columns.slice(1).every((column) => !column.link)).toBe(true);
    expect(table.columns.map((column) => column.label)).toEqual([
      "Title",
      "Slug",
      "Description",
      "Updated",
      "Created",
    ]);
    expect(table.query.literals).toEqual({
      text: { label: "Search", open: '"', close: '"' },
    });
    expect(table.columns.map((column) => column.key)).toEqual([
      "title",
      "slug",
      "description",
      "updatedAt",
      "createdAt",
    ]);
    expect(table.visibleColumns.map((column) => column.key)).toEqual([
      "title",
      "slug",
      "description",
      "updatedAt",
    ]);
    expect(table.filterableColumns.map((column) => column.key)).toEqual([
      "title",
      "slug",
      "description",
      "updatedAt",
      "createdAt",
    ]);
    expect(
      table.columns
        .filter((column) => column.sortable)
        .map((column) => column.key),
    ).toEqual(["title", "slug", "updatedAt", "createdAt"]);
    expect(table.isColumnPinned("title")).toBe(true);
  });

  it("offers each text column the text it holds, carries, starts or ends with, and the optional one present or missing", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { query } = withSetup(() => useContentTable()).result;
    for (const key of ["title", "slug", "description"]) {
      expect(query.fields[key]?.operators, key).toEqual(TEXT_OPERATORS);
    }
    // The title and the slug are never empty, so they offer no presence.
    expect(query.fields.title?.values).toBeUndefined();
    expect(query.fields.slug?.values).toBeUndefined();
    expect(query.fields.description?.values).toEqual(["present", "missing"]);
    // What is written on a page is found by the free text; it has no hero.
    for (const key of ["hero", "body", "status"]) {
      expect(query.fields[key], key).toBeUndefined();
    }
    query.setDraft("Title: about");
    query.submit();
    query.setDraft("Description: is missing");
    query.submit();
    expect(query.filters).toEqual([
      { key: "title", op: "contains", value: "about" },
      { key: "description", op: "is", value: "missing" },
    ]);
  });

  it("offers the days changed and added each way of a span, a bare day the one it is on", () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [], total: 0 })),
    );
    const { query } = withSetup(() => useContentTable()).result;
    for (const key of ["updatedAt", "createdAt"]) {
      expect(query.fields[key]?.operators, key).toEqual(DAY_OPERATORS);
    }
    query.setDraft("Updated: on or after 2026-12-01");
    expect(query.stage).toBe("value");
    query.submit();
    query.setDraft("Updated: on or before 2026-12-31");
    query.submit();
    expect(query.filters).toEqual([
      { key: "updatedAt", op: "on or after", value: "2026-12-01" },
      { key: "updatedAt", op: "on or before", value: "2026-12-31" },
    ]);
  });

  it("fetches a page of the site's pages from the admin's API", async () => {
    const fetch = vi.fn(async () => ({ items: [HOME, ABOUT], total: 2 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => useContentTable()).result;
    await table.fetch();
    expect(fetch).toHaveBeenCalledWith("/api/content", {
      query: { page: 1, size: 25 },
    });
    expect(table.data).toEqual([HOME, ABOUT]);
    expect(table.total).toBe(2);
    expect(table.pageCount).toBe(1);
  });

  it("searches the pages by the text and the filters the search box commits, from the first page, as the API names each", async () => {
    const fetch = vi.fn(async () => ({ items: [ABOUT], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => useContentTable()).result;
    table.goToPage(2);
    table.query.add({ kind: "literal", key: "text", value: "messages" });
    table.query.add({
      kind: "filter",
      key: "description",
      op: "is",
      value: "present",
    });
    table.query.add({
      kind: "filter",
      key: "slug",
      op: "starts with",
      value: "ser",
    });
    table.query.add({ kind: "filter", key: "title", value: "about-us" });
    table.query.add({
      kind: "filter",
      key: "updatedAt",
      op: "before",
      value: "2026-10-31",
    });
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/content", {
      query: {
        page: 1,
        size: 25,
        q: "messages",
        descriptionIs: "present",
        slugStartsWith: "ser",
        titleContains: "about-us",
        updatedAtBefore: "2026-10-31",
      },
    });
  });

  it("sorts the pages by a column the API sorts by, under the key it names", async () => {
    const fetch = vi.fn(async () => ({ items: [ABOUT], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const table = withSetup(() => useContentTable()).result;
    table.goToPage(2);
    table.sortBy("slug");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/content", {
      query: { page: 1, size: 25, sort: "slug", direction: "asc" },
    });
    table.sortBy("slug");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/content", {
      query: { page: 1, size: 25, sort: "slug", direction: "desc" },
    });
  });

  it("asks the API for nothing its query refuses", async () => {
    const { CONTENT_SORT_KEYS, contentQuery } = await import("@bbf/schema");
    const table = withSetup(() => useContentTable()).result;
    expect(
      table.columns
        .filter((column) => column.sortable)
        .map((column) => column.key)
        .sort(),
    ).toEqual([...CONTENT_SORT_KEYS].sort());
    const keys = Object.keys(contentQuery.shape);
    for (const column of table.filterableColumns) {
      expect(
        keys.some((key) => key.startsWith(String(column.key))),
        String(column.key),
      ).toBe(true);
    }
  });

  it("offers an edit of each row that opens the page's editor", () => {
    const [edit] = withSetup(() => useContentTable()).result.actions;
    expect(edit?.label).toBe("Edit");
    edit?.action(HOME);
    expect(navigateTo).toHaveBeenCalledWith("/content/5/page");
  });
});
