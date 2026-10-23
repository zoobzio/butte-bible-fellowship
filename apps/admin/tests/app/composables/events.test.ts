import { describe, expect, it, vi } from "vitest";

import { navigateTo, setRoutePath, useRouter } from "#imports";
import { DINNER, WORSHIP } from "#test/support/records";
import { withSetup } from "#test/support/mount";
import {
  useEventEditor,
  useEventRecord,
  useEventsTable,
} from "~/composables/events";

describe("useEventsTable", () => {
  it("is the events table, the title the way to an event's editor", async () => {
    const fetch = vi.fn(async () => ({ items: [WORSHIP, DINNER], total: 2 }));
    vi.stubGlobal("$fetch", fetch);
    const { result } = withSetup(() => useEventsTable());
    const { table, link } = result;
    expect(table.id).toBe("events");
    expect(table.columns.map((column) => column.key)).toEqual([
      "title",
      "day",
      "date",
      "start",
      "status",
      "updatedAt",
    ]);
    expect(link(DINNER)).toBe("/events/4");
    await table.fetch();
    expect(fetch).toHaveBeenCalledWith("/api/events", {
      query: { page: 1, size: 25 },
    });
    expect(table.data).toEqual([WORSHIP, DINNER]);
    table.actions[0]?.action(WORSHIP);
    expect(navigateTo).toHaveBeenCalledWith("/events/3");
  });
});

describe("useEventRecord", () => {
  it("reads the event the route names from the admin's API", async () => {
    const fetch = vi.fn(async () => DINNER);
    vi.stubGlobal("$fetch", fetch);
    setRoutePath("/events/4", { id: "4" });
    expect((await useEventRecord()).data.value).toEqual(DINNER);
    expect(fetch).toHaveBeenCalledWith("/api/events/4", {});
  });
});

describe("useEventEditor", () => {
  it("creates an event when there is no record", async () => {
    const fetch = vi.fn(async () => DINNER);
    vi.stubGlobal("$fetch", fetch);
    const editor = useEventEditor(null);
    expect(editor.removable).toBe(false);
    Object.assign(editor.draft, {
      slug: "harvest-dinner",
      title: "Harvest Dinner",
      date: "2026-10-24",
      start: "17:30",
    });
    await editor.submit();
    expect(fetch).toHaveBeenCalledWith("/api/events", {
      method: "POST",
      body: {
        slug: "harvest-dinner",
        title: "Harvest Dinner",
        date: "2026-10-24",
        start: "17:30",
        status: "draft",
      },
    });
    expect(useRouter().push).toHaveBeenCalledWith("/events");
  });

  it("replaces the event when there is a record, as weekly or as once", async () => {
    const fetch = vi.fn(async () => WORSHIP);
    vi.stubGlobal("$fetch", fetch);
    const editor = useEventEditor(WORSHIP);
    editor.draft.kind = "once";
    editor.draft.date = "2026-12-24";
    await editor.submit();
    expect(fetch).toHaveBeenCalledWith("/api/events/3", {
      method: "PUT",
      body: expect.objectContaining({ date: "2026-12-24" }),
    });
    expect(fetch.mock.calls[0]?.[1]?.body).not.toHaveProperty("day");
  });

  it("deletes the event, once asked by title", async () => {
    const fetch = vi.fn(async () => null);
    vi.stubGlobal("$fetch", fetch);
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    await useEventEditor(DINNER).destroy();
    expect(confirm).toHaveBeenCalledWith(
      "Delete Harvest Dinner? This cannot be undone.",
    );
    expect(fetch).toHaveBeenCalledWith("/api/events/4", { method: "DELETE" });
  });
});
