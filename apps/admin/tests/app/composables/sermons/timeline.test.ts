import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

import { FAITH, GRACE, HOPE } from "#test/support/records";
import { withSetup } from "@bbf/nuxt/testing/mount";
import { useSermonsTimeline } from "~/composables/sermons/timeline";

/** The timeline over the admin's API answering with what is given. */
const mounted = (answer: (request: { query: object }) => unknown) => {
  const fetch = vi.fn(async (_path: string, request: { query: object }) =>
    answer(request),
  );
  vi.stubGlobal("$fetch", fetch);
  return { fetch, timeline: withSetup(() => useSermonsTimeline()).result };
};

describe("useSermonsTimeline", () => {
  it("is the sermons timeline, the latest first, by the month each was preached in, with a sync and a search", () => {
    const { timeline } = mounted(() => ({ items: [], cursor: null }));
    expect(timeline.id).toBe("sermons");
    expect(timeline.order).toBe("desc");
    expect(timeline.grouping).toBe("month");
    expect(timeline.limit).toBe(30);
    expect(timeline.context.timeZone).toBe("UTC");
    expect(timeline.searchable).toBe(true);
    expect(timeline.sync).toBeDefined();
  });

  it("searches by free text, and filters on the title, the speaker, the status, the day preached and the summary, each named by the prose", () => {
    const { query } = mounted(() => ({ items: [], cursor: null })).timeline;
    expect(
      Object.entries(query.fields).map(([key, field]) => [key, field.label]),
    ).toEqual([
      ["title", "Title"],
      ["speaker", "Speaker"],
      ["status", "Status"],
      ["date", "Preached"],
      ["summary", "Summary"],
    ]);
    expect(Object.keys(query.literals)).toEqual(["text"]);
    expect(query.fields.title?.values).toBeUndefined();
    expect(query.fields.speaker?.values).toEqual(["present", "missing"]);
    expect(query.fields.status?.values).toEqual([
      "draft",
      "published",
      "archived",
    ]);
    expect(query.fields.status?.operators).toEqual(["is", "not"]);
    // The days are offered as they are typed, and so are no list.
    expect(query.fields.date?.values).toBeTypeOf("function");
    expect(query.fields.date?.operators).toEqual([
      "before",
      "after",
      "on",
      "on or after",
      "on or before",
    ]);
  });

  it("asks for the first batch of what the search finds, the text and each filter as the API names it, and polls for the same", async () => {
    const { timeline, fetch } = mounted(() => ({
      items: [GRACE],
      cursor: null,
      since: "7",
    }));
    await timeline.init();
    timeline.query.add({ kind: "literal", key: "text", value: "grace" });
    timeline.query.add({ kind: "filter", key: "status", value: "draft" });
    timeline.query.add({
      kind: "filter",
      key: "speaker",
      op: "is",
      value: "missing",
    });
    timeline.query.add({
      kind: "filter",
      key: "date",
      op: "on or after",
      value: "2026-10-01",
    });
    await flushPromises();
    const query = {
      limit: 30,
      q: "grace",
      statusIs: "draft",
      speakerIs: "missing",
      dateOnOrAfter: "2026-10-01",
    };
    expect(fetch).toHaveBeenLastCalledWith("/api/sermons", { query });
    await timeline.sync!.poll();
    expect(fetch).toHaveBeenLastCalledWith("/api/sermons", {
      query: { ...query, since: "7" },
    });
  });

  it("fetches the first batch, and groups the sermons under the month each was preached in", async () => {
    const { timeline, fetch } = mounted(() => ({
      items: [GRACE, FAITH, HOPE],
      cursor: null,
      since: "7",
    }));
    await timeline.init();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/sermons", {
      query: { limit: 30 },
    });
    expect(
      timeline.groups.map((group) => [
        group.key,
        group.records.map((record) => record.title),
      ]),
    ).toEqual([
      ["2026-10", ["Grace", "Faith & Works"]],
      ["2026-09", ["Hope"]],
    ]);
    expect(timeline.keyOf(FAITH)).toBe("12");
    expect(timeline.labelOf(FAITH)).toBe("Faith & Works");
    expect(timeline.more).toBe(false);
    expect(timeline.sync?.since).toBe("7");
  });

  it("asks for the batch after the one it holds with the cursor that one ended on", async () => {
    const { timeline, fetch } = mounted(({ query }) =>
      "cursor" in query
        ? { items: [HOPE], cursor: null }
        : { items: [GRACE, FAITH], cursor: "2026-10-04.12" },
    );
    await timeline.init();
    expect(timeline.more).toBe(true);
    await timeline.loadMore();
    expect(fetch).toHaveBeenLastCalledWith("/api/sermons", {
      query: { limit: 30, cursor: "2026-10-04.12" },
    });
    expect(timeline.records).toEqual([GRACE, FAITH, HOPE]);
    expect(timeline.more).toBe(false);
  });

  it("polls with the mark it was read at, keeps what it holds where the API answers nothing, and lays in what it answers", async () => {
    const answers: unknown[] = [
      { items: [FAITH, HOPE], cursor: null, since: "7" },
      "",
      {
        items: [GRACE, { ...FAITH, status: "draft" }],
        cursor: null,
        since: "8",
      },
    ];
    const { timeline, fetch } = mounted(() => answers.shift());
    await timeline.init();

    await timeline.sync!.poll();
    expect(fetch).toHaveBeenLastCalledWith("/api/sermons", {
      query: { limit: 30, since: "7" },
    });
    expect(timeline.records).toEqual([FAITH, HOPE]);
    expect(timeline.sync!.since).toBe("7");

    await timeline.sync!.poll();
    // The new sermon leads, the changed one is replaced where it stands.
    expect(timeline.records).toEqual([
      GRACE,
      { ...FAITH, status: "draft" },
      HOPE,
    ]);
    expect(timeline.sync!.since).toBe("8");
  });

  it("refuses a batch that is none of the sermons'", async () => {
    const { timeline } = mounted(() => ({ items: [{ id: 1 }], cursor: null }));
    await expect(timeline.init()).rejects.toThrow();
    expect(timeline.records).toEqual([]);
  });
});
