import type { SermonRecord, ViewRecord } from "@bbf/schema/types";

import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { sermonViewBody } from "@bbf/schema";
import { NuxtPage, Timeline, Views } from "#components";
import { setRoutePath } from "#imports";
import PageHeader from "~/components/PageHeader.vue";
import SermonDetails from "~/components/SermonDetails.vue";
import Index from "~/pages/sermons/index.vue";
import Sermon from "~/pages/sermons/[id].vue";
import Details from "~/pages/sermons/[id]/details.vue";
import { FAITH, GRACE, HOPE } from "#test/support/records";
import { head } from "#test/support/head";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

type Request = { method?: string; body?: object; query?: object };

const ID = "0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f";

/** A view whoever is signed in saved: the published sermons, kept alive. */
const LIVE: ViewRecord = {
  id: ID,
  surface: "sermons",
  name: "On the site",
  payload: {
    clauses: [{ kind: "filter", key: "status", op: "is", value: "published" }],
    interval: 30_000,
  },
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

/**
 * The sermons page over the admin's API holding the sermons given, a sync
 * of which adds the ones given as new, and holding the views given as
 * whoever is signed in has saved them.
 */
const mountSermons = async (
  items: SermonRecord[],
  fresh: SermonRecord[] = [],
  saved: ViewRecord[] = [],
) => {
  const held = { items };
  const fetch = vi.fn(async (path: string, _request: Request = {}) => {
    if (path.startsWith("/api/views/")) return saved;
    if (path === "/api/sermons/sync") {
      held.items = [...fresh, ...held.items];
      return { found: 15, added: fresh.length };
    }
    return { items: held.items, cursor: null, since: "7" };
  });
  vi.stubGlobal("$fetch", fetch);
  const { wrapper, error } = await mountSuspended(Index);
  expect(error).toBeUndefined();
  return { wrapper, fetch };
};

type Mounted = Awaited<ReturnType<typeof mountSermons>>["wrapper"];

/** Each sermon's row: its title, who preached it and when, and its status. */
const cards = (wrapper: Mounted) =>
  wrapper
    .findAll(".f-data-timeline-record")
    .map((card) => [
      card.find(".f-data-timeline-record-label").text(),
      card.find(".sermons-speaker").exists()
        ? card.find(".sermons-speaker").text()
        : null,
      card.find("time").text(),
      card.find(".sermons-status").text(),
    ]);

describe("sermons page", () => {
  it("heads the sermons timeline with the way to sync, the first batch fetched on load", async () => {
    const { wrapper, fetch } = await mountSermons([GRACE, FAITH, HOPE]);
    expect(wrapper.findComponent(PageHeader).props()).toMatchObject({
      title: "Sermons",
      description: "Recordings from the church's YouTube channel.",
      action: "Sync with YouTube",
    });
    expect(head()).toEqual({ title: "Sermons" });
    expect(wrapper.findComponent(Timeline).props("service").id).toBe("sermons");
    // The views load first, so the timeline's one fetch reads the open one.
    expect(fetch.mock.calls).toEqual([
      ["/api/views/sermons", {}],
      ["/api/sermons", { query: { limit: 30 } }],
    ]);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });

  it("lists each sermon under its month, with who preached it and the day, and whether it is on the site", async () => {
    const { wrapper } = await mountSermons([GRACE, FAITH, HOPE]);
    expect(
      wrapper
        .findAll(".f-data-timeline-group")
        .map((group) => group.attributes("data-group")),
    ).toEqual(["2026-10", "2026-09"]);
    expect(cards(wrapper)).toEqual([
      ["Grace", null, "October 11, 2026", "Draft"],
      ["Faith & Works", "Pastor Name", "October 4, 2026", "Published"],
      ["Hope", null, "September 27, 2026", "Archived"],
    ]);
    expect(
      wrapper
        .findAll(".sermons-status")
        .map((status) => status.attributes("data-status")),
    ).toEqual(["draft", "published", "archived"]);
    // Nothing on the page changes a sermon.
    expect(wrapper.findAll(".f-data-timeline-record button")).toEqual([]);
    expect(
      wrapper
        .findAll(".f-data-timeline-record-time time")
        .map((time) => time.attributes("datetime")),
    ).toEqual(["2026-10-11", "2026-10-04", "2026-09-27"]);
  });

  it("leads each sermon's title to its own page", async () => {
    const { wrapper } = await mountSermons([GRACE, FAITH]);
    expect(
      wrapper
        .findAll("a.f-data-timeline-record-label")
        .map((title) => [title.text(), title.attributes("href")]),
    ).toEqual([
      ["Grace", "/sermons/13/details"],
      ["Faith & Works", "/sermons/12/details"],
    ]);
  });

  it("leads each row with the sermon's picture, its own or a frame of its recording, and an empty frame where it has neither", async () => {
    const { wrapper } = await mountSermons([
      { ...GRACE, image: "https://example.com/grace.jpg" },
      FAITH,
      HOPE,
    ]);
    const frames = wrapper.findAll(".sermons-thumbnail");
    expect(
      frames.map((frame) => {
        const picture = frame.find("img");
        return picture.exists() ? picture.attributes("src") : null;
      }),
    ).toEqual([
      "https://example.com/grace.jpg",
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      null,
    ]);
    // The picture says nothing the title beside it does not.
    expect(frames[0]!.find("img").attributes("alt")).toBe("");
    expect(frames[2]!.find("svg").exists()).toBe(true);
  });

  it("offers the search over the timeline", async () => {
    const { wrapper } = await mountSermons([GRACE]);
    expect(wrapper.find(".f-data-timeline-search").exists()).toBe(true);
  });

  it("links each recorded sermon to its recording, and one with none to nothing", async () => {
    const { wrapper } = await mountSermons([GRACE, FAITH, HOPE]);
    expect(
      wrapper
        .findAll("a.sermons-watch")
        .map((link) => [
          link.attributes("href"),
          link.attributes("aria-label"),
          link.attributes("target"),
          link.attributes("rel"),
        ]),
    ).toEqual([
      [
        "https://www.youtube.com/watch?v=a_b-c123456",
        "Watch “Grace” on YouTube",
        "_blank",
        "noopener noreferrer",
      ],
      [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "Watch “Faith & Works” on YouTube",
        "_blank",
        "noopener noreferrer",
      ],
    ]);
  });

  it("syncs from the header, lists the sermons added first, and says how many there were", async () => {
    const { wrapper, fetch } = await mountSermons([FAITH], [GRACE]);
    await wrapper.find("button.page-header-action").trigger("click");
    expect(wrapper.find("button.page-header-action").text()).toBe("Syncing…");
    await flushPromises();
    expect(wrapper.find("button.page-header-action").text()).toBe(
      "Sync with YouTube",
    );
    expect(fetch).toHaveBeenCalledWith("/api/sermons/sync", { method: "POST" });
    expect(cards(wrapper).map(([title]) => title)).toEqual([
      "Grace",
      "Faith & Works",
    ]);
    expect(wrapper.find('[role="status"]').text()).toBe("1 sermon added.");
  });

  it("says so where a sync finds nothing new", async () => {
    const { wrapper } = await mountSermons([FAITH]);
    await wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    expect(wrapper.find('[role="status"]').text()).toBe("Already up to date.");
  });

  it("reports a sync that fails in the status's place", async () => {
    const { wrapper, fetch } = await mountSermons([FAITH]);
    fetch.mockRejectedValueOnce({ data: { message: "YouTube answered 500" } });
    await wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    expect(wrapper.find('[role="alert"]').text()).toBe("YouTube answered 500");
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });
});

describe("sermons views", () => {
  const services = (wrapper: Mounted) => ({
    views: wrapper.findComponent(Views).props("service"),
    timeline: wrapper.findComponent(Timeline).props("service"),
  });

  it("opens on the admin's own view, the timeline as it starts, with nothing edited", async () => {
    const { wrapper } = await mountSermons([GRACE, FAITH]);
    const { views, timeline } = services(wrapper);
    expect(views.id).toBe("sermons");
    expect(views.initialized).toBe(true);
    expect(views.views).toMatchObject([
      { id: "all", name: "admin.sermons.allView", origin: "system" },
    ]);
    expect(views.active).toBe("all");
    expect(views.current.payload).toEqual(timeline.snapshot());
    expect(views.drifted).toBe(false);
    expect(wrapper.findAll(".f-views-tabs .f-tabs-trigger")).toHaveLength(1);
  });

  it("lists the views whoever is signed in has saved after it, and puts one picked in place from the first batch", async () => {
    const { wrapper, fetch } = await mountSermons([GRACE, FAITH], [], [LIVE]);
    const { views, timeline } = services(wrapper);
    expect(views.views).toMatchObject([
      { id: "all", origin: "system" },
      { id: ID, name: "On the site", origin: "user" },
    ]);
    expect(views.stale).toEqual([]);

    expect(await views.select(ID)).toBe(true);
    await flushPromises();
    expect(views.active).toBe(ID);
    expect(timeline.snapshot()).toEqual(LIVE.payload);
    expect(fetch).toHaveBeenLastCalledWith("/api/sermons", {
      query: { limit: 30, statusIs: "published" },
    });
    expect(views.drifted).toBe(false);
  });

  it("marks the open view as edited once the timeline is searched, and not when it reads further down", async () => {
    const { wrapper } = await mountSermons([GRACE, FAITH]);
    const { views, timeline } = services(wrapper);
    await timeline.loadMore();
    await flushPromises();
    expect(views.drifted).toBe(false);
    timeline.query.add({ kind: "literal", key: "text", value: "grace" });
    await flushPromises();
    expect(views.drifted).toBe(true);
    expect(wrapper.find(".f-views").classes()).toContain("f-views-drifted");
  });

  it("saves a view under the sermons' own name, as the API takes it", async () => {
    const { wrapper, fetch } = await mountSermons([GRACE, FAITH]);
    const { views, timeline } = services(wrapper);
    timeline.query.add({ kind: "filter", key: "speaker", value: "Pastor" });
    await flushPromises();
    const view = await views.saveAs("By the pastor");
    const [path, request] = fetch.mock.calls.at(-1)!;
    expect(path).toBe(`/api/views/sermons/${view.id}`);
    expect(request).toMatchObject({
      method: "PUT",
      body: { name: "By the pastor", payload: timeline.snapshot() },
    });
    expect(
      sermonViewBody.safeParse((request as { body: unknown }).body).success,
    ).toBe(true);
  });

  it("sets aside a saved view the sermons' schema would refuse", async () => {
    const stale = {
      ...LIVE,
      payload: { clauses: [{ kind: "filter", key: "video", value: "abc" }] },
    };
    const { wrapper } = await mountSermons([GRACE], [], [stale]);
    const { views } = services(wrapper);
    expect(views.views.map((view: { id: string }) => view.id)).toEqual(["all"]);
    expect(views.stale).toHaveLength(1);
  });
});

describe("sermon page", () => {
  const WRITTEN = {
    ...FAITH,
    summary: "James 2, and what faith does.",
    body: "## James 2\n\nWhat faith does.",
  };

  const mountSermon = async (path = "/sermons/12/details") => {
    const fetch = vi.fn(async (_path: string) => WRITTEN);
    vi.stubGlobal("$fetch", fetch);
    setRoutePath(path, { id: "12" });
    return { ...(await mountSuspended(Sermon)), fetch };
  };

  it("heads the sermon the address names, and hands it to the page under it", async () => {
    const { wrapper, error, fetch } = await mountSermon();
    expect(error).toBeUndefined();
    expect(fetch.mock.calls[0]![0]).toBe("/api/sermons/12");
    const header = wrapper.findComponent(PageHeader);
    expect(header.props()).toMatchObject({
      title: "Faith & Works",
      description: "James 2, and what faith does.",
      back: { label: "Sermons", to: "/sermons", icon: "chevron-left" },
    });
    // There is nothing to do to a sermon from its header.
    expect(header.props("action")).toBeUndefined();
    expect(wrapper.findComponent(NuxtPage).props("record")).toEqual(WRITTEN);
    expect(head()).toEqual({ title: "Faith & Works" });
  });

  it("offers the sermon's pages as tabs, its details the first and only one", async () => {
    const { wrapper } = await mountSermon();
    expect(wrapper.findComponent(PageHeader).props("tabs")).toEqual([
      { label: "Details", to: "/sermons/12/details" },
    ]);
  });

  it("throws a 404 when no sermon has the id", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("404"), { status: 404 });
      }),
    );
    setRoutePath("/sermons/99/details", { id: "99" });
    const { wrapper, error } = await mountSuspended(Sermon);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Sermon not found",
    });
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("throws a 404 for an address that names no number", async () => {
    const fetch = vi.fn(async () => WRITTEN);
    vi.stubGlobal("$fetch", fetch);
    setRoutePath("/sermons/x/details", { id: "x" });
    const { error } = await mountSuspended(Sermon);
    expect(error).toMatchObject({ statusCode: 404 });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("sermon details page", () => {
  it("lays the sermon out in two panels: its details, then its recording over what is written about it", () => {
    const wrapper = mount(Details, { props: { record: FAITH } });
    const panels = wrapper.find(".sermon-page").element.children;
    expect([...panels].map((panel) => panel.className)).toEqual([
      "sermon-page-side",
      "sermon-page-main",
    ]);
    expect(
      wrapper
        .find(".sermon-page-side")
        .findComponent(SermonDetails)
        .props("record"),
    ).toEqual(FAITH);
    expect(
      [...wrapper.find(".sermon-page-main").element.children].map(
        (panel) => panel.className,
      ),
    ).toEqual(["sermon-recording", "sermon-body"]);
  });

  it("plays the recording in YouTube's own player, named by the sermon", () => {
    const wrapper = mount(Details, { props: { record: FAITH } });
    const player = wrapper.find(".sermon-recording-frame iframe");
    expect(player.attributes()).toMatchObject({
      src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      title: "Faith & Works",
      allowfullscreen: "",
    });
    expect(player.attributes("allow")).toContain("fullscreen");
    expect(wrapper.find(".sermon-recording h2").text()).toBe("Recording");
  });

  it("says so in the player's place where the sermon has no recording", () => {
    const wrapper = mount(Details, { props: { record: HOPE } });
    expect(wrapper.find("iframe").exists()).toBe(false);
    expect(wrapper.find(".sermon-recording-frame").text()).toBe(
      "This sermon has no recording.",
    );
  });

  it("shows what is written about the sermon as it was written, or that nothing is", () => {
    const body = "## James 2\n\nWhat faith does.";
    const written = mount(Details, { props: { record: { ...FAITH, body } } });
    expect(written.find(".sermon-body h2").text()).toBe("About");
    expect(written.find(".sermon-body-text").element.textContent).toBe(body);
    expect(written.find(".sermon-body-empty").exists()).toBe(false);

    const blank = mount(Details, { props: { record: FAITH } });
    expect(blank.find(".sermon-body-text").exists()).toBe(false);
    expect(blank.find(".sermon-body-empty").text()).toBe(
      "Nothing is written about this sermon yet.",
    );
  });

  it("offers nothing that changes the sermon", () => {
    const wrapper = mount(Details, { props: { record: FAITH } });
    expect(wrapper.find(".save-bar").exists()).toBe(false);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false);
  });
});
