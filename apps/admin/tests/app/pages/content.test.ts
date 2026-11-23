import type {
  ContentRecord,
  FolderRecord,
  ViewRecord,
} from "@bbf/schema/types";

import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

import { Browser, Dialog, Editor, Views } from "#components";
import { navigateTo, setRoutePath, useRouter } from "#imports";
import ContentBody from "~/components/ContentBody.vue";
import ContentDocument from "~/components/ContentDocument.vue";
import ContentEditor from "~/components/ContentEditor.vue";
import ContentFolder from "~/components/ContentFolder.vue";
import ContentMenu from "~/components/ContentMenu.vue";
import FolderEditor from "~/components/FolderEditor.vue";
import PageHeader from "~/components/PageHeader.vue";
import SaveBar from "~/components/SaveBar.vue";
import Page from "~/pages/content/[...path].vue";
import { browse } from "~/constants/content";
import { HOME, ABOUT, NOTES, ROMANS } from "#test/support/records";
import { head } from "#test/support/head";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

type Request = { method?: string; query?: Record<string, unknown> };

/** What one folder holds: the folders inside it, and the documents filed in it. */
type Held = { folders?: FolderRecord[]; documents?: ContentRecord[] };

/** The folders under the top, each by its path as an address spells it. */
type Inside = Record<string, Held>;

/** A view of the content someone saved: the images, the largest first. */
const IMAGES: ViewRecord = {
  id: "0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f",
  surface: "content",
  name: "Images",
  payload: {
    sortField: "size",
    sortDirection: "desc",
    clauses: [
      { kind: "filter", key: "mime", op: "starts with", value: "image/" },
    ],
  },
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

/** Where the notes are browsed, and read: their path, as an address has it. */
const IN_NOTES = "/content/Sermon%20notes";
const NOTES_API = "/api/content/Sermon%20notes";

/** A folder as the API answers with it: what it holds. */
const folder = (held: Held) => ({
  kind: "folder" as const,
  folders: held.folders ?? [],
  files: held.documents ?? [],
});

/**
 * The admin's API over the content: the top holds `top`, and each folder
 * under it what `inside` gives under its path, `Sermon notes/Romans` the
 * folder of that name inside the notes. A path is answered with the folder
 * it names, or the document of its last step filed in the folder above, and
 * is not found otherwise. Every write answers with `answer`, and the views
 * whoever is signed in has saved are `saved`.
 */
const api = (
  top: Held,
  inside: Inside = {},
  answer?: unknown,
  saved: ViewRecord[] = [],
) =>
  vi.fn(async (path: string, request: Request = {}) => {
    if (request.method !== undefined) return answer;
    if (path.startsWith("/api/views/")) return saved;
    const steps = path
      .slice("/api/content".length)
      .split("/")
      .filter((step) => step !== "")
      .map((step) => decodeURIComponent(step));
    const held = (at: string[]) =>
      at.length === 0 ? top : inside[at.join("/")];
    const here = held(steps);
    if (here !== undefined) return folder(here);
    const record = held(steps.slice(0, -1))?.documents?.find(
      (document) => document.slug === steps.at(-1),
    );
    if (record === undefined) {
      throw Object.assign(new Error("Folder or document not found"), {
        status: 404,
      });
    }
    return { kind: "document", record };
  });

/** Puts the page's address at a path of the content: the top, with none. */
const at = (...path: string[]) => setRoutePath(browse(path), { path } as never);

/** The content's page, at the address it stands at, over whatever the API holds. */
const visit = async () => {
  const { wrapper, error } = await mountSuspended(Page);
  return { wrapper, error };
};

/**
 * The content page over the admin's API holding what is given, at the
 * address it stands at: the top, unless `at` put it elsewhere.
 */
const mountContent = async (
  top: Held,
  inside: Inside = {},
  answer?: unknown,
  saved: ViewRecord[] = [],
) => {
  const fetch = api(top, inside, answer, saved);
  vi.stubGlobal("$fetch", fetch);
  const { wrapper, error } = await visit();
  expect(error).toBeUndefined();
  return { wrapper, fetch };
};

type Mounted = Awaited<ReturnType<typeof mountContent>>["wrapper"];

/**
 * Moves to another page of the content, as a link followed does: the page
 * that was drawn goes, and the one at the new address is drawn in its
 * place, over the same API.
 */
const go = async (from: Mounted, ...path: string[]) => {
  from.unmount();
  at(...path);
  const { wrapper, error } = await visit();
  expect(error).toBeUndefined();
  return wrapper;
};

/** The titles of the page's own dialogs: the views have theirs too. */
const DIALOGS = {
  document: "New document",
  folder: "New folder",
};

/** A dialog of the page's own, by its title. */
const dialogOf = (wrapper: Mounted, title: string) =>
  wrapper
    .findAllComponents(Dialog)
    .find((dialog) => dialog.props("title") === title)!;

/** The writes the API was asked for, the reads left out. */
const writes = (fetch: ReturnType<typeof api>) =>
  fetch.mock.calls.filter(([, request]) => request?.method !== undefined);

/** The reads of the content the API was asked for, the views' left out. */
const reads = (fetch: ReturnType<typeof api>) =>
  fetch.mock.calls.filter(
    ([path, request]) =>
      request?.method === undefined && path.startsWith("/api/content"),
  );

/** Picks an action of the menu that is open, by its label. */
const pick = async (label: string) => {
  const item = [
    ...document.body.querySelectorAll<HTMLElement>("[role=menuitem]"),
  ].find((entry) => entry.textContent?.trim() === label);
  expect(item, label).toBeDefined();
  item!.click();
  await flushPromises();
};

/** Opens the actions of a row, and picks one. */
const act = async (wrapper: Mounted, row: string, label: string) => {
  const trigger = wrapper.find(`${row} .f-data-browser-actions button`);
  await trigger.trigger("pointerdown", { button: 0, ctrlKey: false });
  await trigger.trigger("click");
  await flushPromises();
  await pick(label);
};

const FOLDER = ".f-data-browser-folder";
const POST = ".f-data-browser-files .f-tr";

/** The browser the page draws. */
const browserOf = (wrapper: Mounted) =>
  wrapper.findComponent(Browser).props("service");

describe("content page", () => {
  it("heads the content browser with the ways to a new document and a new folder, the top asked for in one request", async () => {
    const { wrapper, fetch } = await mountContent({
      folders: [NOTES],
      documents: [HOME, ABOUT],
    });
    expect(wrapper.findComponent(ContentFolder).exists()).toBe(true);
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: "Content",
      description: "Documents, organized in folders.",
      action: "New document",
    });
    expect(wrapper.find("button.content-new-folder").text()).toBe("New folder");
    const browser = wrapper.findComponent(Browser);
    expect(browser.props("service").id).toBe("content");
    // The views load first, so the one request of the content reads the
    // open one: the folders and the documents come back together.
    expect(fetch.mock.calls).toEqual([
      ["/api/views/content", {}],
      ["/api/content", { query: {} }],
    ]);
    expect(browser.props("service").initialized).toBe(true);
    expect(browser.props("service").files).toEqual([HOME, ABOUT]);
    expect(browser.props("service").folders).toEqual([
      {
        key: "Sermon notes",
        label: "Sermon notes",
        count: 1,
        values: { size: 4096, updatedAt: "2026-10-18T09:30:00.000Z" },
        link: { to: IN_NOTES },
      },
    ]);
    expect(head()).toEqual({ title: "Content" });
  });

  it("lists the folders first, each with what it holds, then the documents, each title the way to its page", async () => {
    const { wrapper } = await mountContent({
      folders: [NOTES],
      documents: [HOME, ABOUT],
    });
    expect(wrapper.find(".f-data-browser table").exists()).toBe(true);
    const folders = wrapper.findAll(`${FOLDER} .f-data-browser-folder-btn`);
    expect(folders.map((folder) => folder.text())).toEqual(["Sermon notes"]);
    const links = wrapper.findAll(`${POST} .f-td > a.f-anchor`);
    expect(links.map((link) => link.attributes("href"))).toEqual([
      "/content/index",
      "/content/about-us",
    ]);
    expect(links.map((link) => link.text())).toEqual([
      "Butte Bible Fellowship",
      "About Us",
    ]);
    expect(
      wrapper
        .findAll(
          `${POST}:first-child .f-td:not(.f-data-browser-select, .f-data-browser-actions)`,
        )
        .map((cell) => cell.text()),
    ).toEqual([
      "Butte Bible Fellowship",
      "index",
      "application/vnd.bbf.article+json",
      "2 kB",
      expect.stringContaining("2026"),
    ]);
  });

  it("shows of a folder, under the documents' columns, how much all that is under it holds and when the last of it was changed", async () => {
    const { wrapper } = await mountContent({ folders: [NOTES] });
    const cells = wrapper
      .findAll(
        `${FOLDER} .f-td:not(.f-data-browser-select, .f-data-browser-actions)`,
      )
      .map((cell) => cell.text());
    // Its name, nothing under the slug or the type, then
    // its size and the day.
    expect(cells).toEqual([
      "Sermon notes",
      "",
      "",
      "4 kB",
      expect.stringContaining("Oct 18, 2026"),
    ]);
  });

  it("names the top of the trail after the content", async () => {
    const { wrapper } = await mountContent({ documents: [HOME] });
    expect(wrapper.find(".f-data-browser-breadcrumb").text()).toBe("Content");
    expect(browserOf(wrapper).pathKeys).toEqual([]);
  });

  it("draws a folder's row as a link to the folder's own page, which is what opens it: nothing is asked for here", async () => {
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES], documents: [HOME] },
      { "Sermon notes": { folders: [ROMANS] } },
    );
    const row = wrapper.find(`${FOLDER} .f-data-browser-folder-btn`);
    expect(row.element.tagName).toBe("A");
    expect(row.attributes("href")).toBe(IN_NOTES);
    expect(row.find("svg use").attributes("href")).toBe("#folder");
    fetch.mockClear();
    await row.trigger("click");
    await flushPromises();
    expect(fetch).not.toHaveBeenCalled();
    expect(browserOf(wrapper).pathKeys).toEqual([]);
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it("opens on the folder the address names, in one request of the folder's own path, its trail read off the address", async () => {
    at("Sermon notes", "Romans");
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES], documents: [HOME] },
      {
        "Sermon notes": { folders: [ROMANS] },
        "Sermon notes/Romans": { documents: [ABOUT] },
      },
    );
    expect(browserOf(wrapper).pathKeys).toEqual(["Sermon notes", "Romans"]);
    expect(
      wrapper
        .findAll(".f-data-browser-breadcrumb .f-li")
        .map((crumb) => crumb.text()),
    ).toEqual(["Content", "Sermon notes", "Romans"]);
    // Nothing is asked of the API for the trail, nor for the folders above.
    expect(reads(fetch)).toEqual([
      ["/api/content/Sermon%20notes/Romans", { query: {} }],
    ]);
    expect(
      wrapper.findAll(`${POST} a.f-anchor`).map((link) => link.text()),
    ).toEqual(["About Us"]);
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it("lists what a folder holds under the folder's own path: a folder inside it, and a document filed in it", async () => {
    at("Sermon notes");
    const { wrapper } = await mountContent(
      { folders: [NOTES] },
      { "Sermon notes": { folders: [ROMANS], documents: [ABOUT] } },
    );
    expect(
      wrapper.find(`${FOLDER} .f-data-browser-folder-btn`).attributes("href"),
    ).toBe("/content/Sermon%20notes/Romans");
    expect(wrapper.find(`${POST} a.f-anchor`).attributes("href")).toBe(
      "/content/Sermon%20notes/about-us",
    );
    expect(browserOf(wrapper).folders[0].link).toEqual({
      to: "/content/Sermon%20notes/Romans",
    });
  });

  it("draws each folder above the open one as a link to its own page, which is what leads back: a crumb picked asks for nothing here", async () => {
    at("Sermon notes", "Romans");
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { "Sermon notes": { folders: [ROMANS] }, "Sermon notes/Romans": {} },
    );
    const links = wrapper.findAll(".f-data-browser-breadcrumb .f-li > a");
    expect(links.map((link) => [link.text(), link.attributes("href")])).toEqual(
      [
        ["Content", "/content"],
        ["Sermon notes", IN_NOTES],
      ],
    );
    // The open folder is where the trail ends, and leads nowhere.
    expect(
      wrapper.find(".f-data-browser-breadcrumb .f-li:last-child > a").exists(),
    ).toBe(false);
    fetch.mockClear();
    await links[0]!.trigger("click");
    await links[1]!.trigger("click");
    await flushPromises();
    expect(fetch).not.toHaveBeenCalled();
    expect(browserOf(wrapper).pathKeys).toEqual(["Sermon notes", "Romans"]);
  });

  it("is the top at the content's own address, wherever the browser was left", async () => {
    at("Sermon notes");
    const first = await mountContent(
      { folders: [NOTES], documents: [HOME] },
      { "Sermon notes": {} },
    );
    expect(browserOf(first.wrapper).pathKeys).toEqual(["Sermon notes"]);
    const wrapper = await go(first.wrapper);
    expect(browserOf(wrapper).pathKeys).toEqual([]);
    expect(first.fetch).toHaveBeenLastCalledWith("/api/content", {
      query: {},
    });
    expect(
      wrapper.findAll(`${POST} a.f-anchor`).map((link) => link.text()),
    ).toEqual(["Butte Bible Fellowship"]);
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it("throws a 404 where the path names nothing, and draws nothing", async () => {
    at("Sermon notes", "Gone", "deeper");
    const fetch = api({ folders: [NOTES] }, { "Sermon notes": {} });
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, error } = await visit();
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Folder or document not found",
    });
    expect(reads(fetch)).toEqual([
      ["/api/content/Sermon%20notes/Gone/deeper", { query: {} }],
    ]);
    expect(wrapper.findComponent(Browser).exists()).toBe(false);
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("encodes each name of a path as one step of the address, whatever is in it", async () => {
    const odd = { ...NOTES, name: "Q&A: one, two + three!" };
    at("Q&A: one, two + three!");
    const { wrapper, fetch } = await mountContent(
      { folders: [odd] },
      { "Q&A: one, two + three!": { documents: [ABOUT] } },
    );
    expect(reads(fetch)).toEqual([
      ["/api/content/Q%26A%3A%20one%2C%20two%20%2B%20three!", { query: {} }],
    ]);
    expect(wrapper.find(`${POST} a.f-anchor`).attributes("href")).toBe(
      "/content/Q%26A%3A%20one%2C%20two%20%2B%20three!/about-us",
    );
    expect(
      wrapper
        .findAll(".f-data-browser-breadcrumb .f-li")
        .map((crumb) => crumb.text()),
    ).toEqual(["Content", "Q&A: one, two + three!"]);
  });

  it("counts what the open folder lists beside the trail", async () => {
    const { wrapper } = await mountContent({
      folders: [NOTES],
      documents: [HOME, ABOUT],
    });
    expect(wrapper.find(".f-data-browser-summary").text()).toBe(
      "1 folder, 2 files",
    );
  });

  it("offers a search of the open folder: its text, and the title, the slug, the media type and the day last changed, each by the operators the API answers", async () => {
    const { wrapper } = await mountContent({ documents: [HOME] });
    expect(
      wrapper.find(".f-data-browser-search .f-autocomplete-input").exists(),
    ).toBe(true);
    const { query } = browserOf(wrapper);
    expect(query.literals).toEqual({
      text: { label: "Search", open: '"', close: '"' },
    });
    // The size is sorted by, and filtered by nothing.
    expect(Object.keys(query.fields)).toEqual([
      "title",
      "slug",
      "mime",
      "updatedAt",
    ]);
    for (const key of ["title", "slug", "mime"]) {
      expect(query.fields[key].operators, key).toEqual([
        "contains",
        "not contains",
        "starts with",
        "ends with",
        "is",
        "not",
      ]);
      expect(query.fields[key].values, key).toBeUndefined();
    }
    expect(query.fields.updatedAt.operators).toEqual([
      "before",
      "after",
      "on",
      "on or after",
      "on or before",
    ]);
    const { contentQuery } = await import("@bbf/schema");
    const keys = Object.keys(contentQuery.shape);
    for (const field of Object.keys(query.fields)) {
      expect(
        keys.some((key) => key.startsWith(field)),
        field,
      ).toBe(true);
    }
  });

  it("searches the open folder by the text and the filters the search commits, in one request of its path", async () => {
    at("Sermon notes");
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { "Sermon notes": { documents: [HOME] } },
    );
    const { query } = browserOf(wrapper);
    fetch.mockClear();
    query.add({ kind: "literal", key: "text", value: "fellowship" });
    await flushPromises();
    expect(fetch.mock.calls).toEqual([
      [NOTES_API, { query: { q: "fellowship" } }],
    ]);
    query.setDraft("Title: butte");
    query.submit();
    query.add({
      kind: "filter",
      key: "updatedAt",
      op: "on or after",
      value: "2026-10-01",
    });
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith(NOTES_API, {
      query: {
        q: "fellowship",
        titleContains: "butte",
        updatedAtOnOrAfter: "2026-10-01",
      },
    });
  });

  it("drops the search and the selection on arriving at another folder, which is asked for with nothing searched for, and says when a search finds nothing", async () => {
    at("Sermon notes");
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { "Sermon notes": { documents: [HOME] } },
    );
    const browser = browserOf(wrapper);
    browser.toggleRow("index");
    expect(browser.hasSelection).toBe(true);
    // The search finds nothing: the folder comes back holding none.
    fetch.mockImplementation(async () => folder({}));
    browser.query.add({ kind: "literal", key: "text", value: "nothing" });
    await flushPromises();
    expect(browser.isFiltered).toBe(true);
    expect(wrapper.find("tbody.f-data-browser-empty .f-td").text()).toBe(
      "No matches",
    );
    fetch.mockClear();
    const top = await go(wrapper);
    expect(reads(fetch)).toEqual([["/api/content", { query: {} }]]);
    expect(browserOf(top).isFiltered).toBe(false);
    expect(browserOf(top).query.text).toBe("");
    expect(browserOf(top).hasSelection).toBe(false);
  });

  it("asks for a folder come back to as the browser was left: its search kept, and its sort kept wherever it goes", async () => {
    at("Sermon notes");
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { "Sermon notes": { documents: [HOME] } },
    );
    const browser = browserOf(wrapper);
    browser.sortBy("size");
    browser.query.add({ kind: "literal", key: "text", value: "fellowship" });
    await flushPromises();

    // The same folder, loaded again: what was searched for still is.
    fetch.mockClear();
    const again = await go(wrapper, "Sermon notes");
    expect(reads(fetch)).toEqual([
      [
        NOTES_API,
        { query: { q: "fellowship", sort: "size", direction: "asc" } },
      ],
    ]);
    expect(browserOf(again).isFiltered).toBe(true);

    // Another folder: the sort goes with the browser, the search does not.
    fetch.mockClear();
    await go(again);
    expect(reads(fetch)).toEqual([
      ["/api/content", { query: { sort: "size", direction: "asc" } }],
    ]);
  });

  it("sorts what the folder holds by a column the sort menu offers, and the other way on a second ask", async () => {
    const { wrapper, fetch } = await mountContent({ documents: [HOME, ABOUT] });
    const browser = browserOf(wrapper);
    expect(
      browser.sortableColumns.map((column: { key: string }) => column.key),
    ).toEqual(["title", "slug", "mime", "size", "updatedAt"]);
    const trigger = wrapper.find(".f-data-browser-toolbar button");
    await trigger.trigger("pointerdown", { button: 0, ctrlKey: false });
    await trigger.trigger("click");
    await flushPromises();
    await pick("Slug");
    expect(fetch).toHaveBeenLastCalledWith("/api/content", {
      query: { sort: "slug", direction: "asc" },
    });
    browser.sortBy("slug");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/content", {
      query: { sort: "slug", direction: "desc" },
    });
  });

  it("says when a folder holds nothing", async () => {
    const { wrapper } = await mountContent({});
    // Under the head: the trail there is the way back out of it.
    expect(wrapper.find(".f-data-browser-breadcrumb").exists()).toBe(true);
    expect(wrapper.find("tbody.f-data-browser-empty .f-td").exists()).toBe(
      true,
    );
    expect(wrapper.find(FOLDER).exists()).toBe(false);
    expect(wrapper.find(POST).exists()).toBe(false);
  });

  it("leads to a document's page from its row's actions: its slug under the folder that is open", async () => {
    const { wrapper } = await mountContent(
      { documents: [HOME] },
      { "Sermon notes": { documents: [ABOUT] } },
    );
    await act(wrapper, POST, "Edit");
    expect(navigateTo).toHaveBeenCalledWith("/content/index");
    const notes = await go(wrapper, "Sermon notes");
    await act(notes, POST, "Edit");
    expect(navigateTo).toHaveBeenLastCalledWith(
      "/content/Sermon%20notes/about-us",
    );
  });
});

describe("content views", () => {
  const services = (wrapper: Mounted) => ({
    views: wrapper.findComponent(Views).props("service"),
    browser: wrapper.findComponent(Browser).props("service"),
  });

  const ids = (views: { views: { id: string }[] }) =>
    views.views.map((view) => view.id);

  it("opens on the admin's own view, the browser as it starts, with nothing edited", async () => {
    const { wrapper } = await mountContent({ documents: [HOME] });
    const { views, browser } = services(wrapper);
    expect(views.id).toBe("content");
    expect(views.initialized).toBe(true);
    expect(views.views).toMatchObject([
      { id: "all", name: "admin.content.allView", origin: "system" },
    ]);
    expect(views.active).toBe("all");
    expect(views.current.payload).toEqual(browser.snapshot());
    expect(views.drifted).toBe(false);
    expect(views.editable).toBe(false);
    expect(wrapper.find(".f-views").classes()).not.toContain("f-views-drifted");
    expect(wrapper.findAll(".f-views-tabs .f-tabs-trigger")).toHaveLength(1);
  });

  it("lists the views whoever is signed in has saved after it, each their own, a tab apiece", async () => {
    const { wrapper } = await mountContent({ documents: [HOME] }, {}, null, [
      IMAGES,
    ]);
    const { views } = services(wrapper);
    expect(views.views).toMatchObject([
      { id: "all", origin: "system" },
      { id: IMAGES.id, name: "Images", origin: "user" },
    ]);
    expect(views.stale).toEqual([]);
    expect(wrapper.findAll(".f-views-tabs .f-tabs-trigger")).toHaveLength(2);
    expect(wrapper.find(".f-views-tabs").text()).toContain("Images");
  });

  it("puts a view picked in place in the folder that is open, and lists it afresh as the view arranges it", async () => {
    at("Sermon notes");
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { "Sermon notes": { documents: [HOME] } },
      null,
      [IMAGES],
    );
    const { views, browser } = services(wrapper);
    fetch.mockClear();
    expect(await views.select(IMAGES.id)).toBe(true);
    await flushPromises();
    expect(reads(fetch)).toEqual([
      [
        NOTES_API,
        {
          query: {
            mimeStartsWith: "image/",
            sort: "size",
            direction: "desc",
          },
        },
      ],
    ]);
    expect(browser.pathKeys).toEqual(["Sermon notes"]);
    expect(views.active).toBe(IMAGES.id);
    expect(views.editable).toBe(true);
    expect(views.drifted).toBe(false);
  });

  it("marks the open view as edited once the browser moves off it, and holds a view picked over the edit", async () => {
    const { wrapper } = await mountContent({ documents: [HOME] }, {}, null, [
      IMAGES,
    ]);
    const { views, browser } = services(wrapper);
    browser.query.add({ kind: "literal", key: "text", value: "fellowship" });
    await flushPromises();
    expect(views.drifted).toBe(true);
    expect(wrapper.find(".f-views").classes()).toContain("f-views-drifted");
    expect(wrapper.find(".f-views-badge").exists()).toBe(true);
    expect(await views.select(IMAGES.id)).toBe(false);
    expect(views.pending).toEqual({ kind: "select", id: IMAGES.id });
    await views.resolve("cancel");
    expect(views.active).toBe("all");
    browser.query.clear();
    await flushPromises();
    expect(views.drifted).toBe(false);
  });

  it("saves the browser as it stands as a view of the user's own, through the API, the open folder no part of it", async () => {
    at("Sermon notes");
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { "Sermon notes": { documents: [HOME] } },
    );
    const { views, browser } = services(wrapper);
    browser.query.add({ kind: "literal", key: "text", value: "fellowship" });
    await flushPromises();
    fetch.mockClear();
    const view = await views.saveAs("Fellowship");
    expect(view.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(fetch.mock.calls).toEqual([
      [
        `/api/views/content/${view.id}`,
        {
          method: "PUT",
          body: {
            name: "Fellowship",
            payload: {
              sortField: null,
              sortDirection: "asc",
              clauses: [{ kind: "literal", key: "text", value: "fellowship" }],
            },
          },
        },
      ],
    ]);
    expect(views.active).toBe(view.id);
    expect(views.editable).toBe(true);
    expect(views.drifted).toBe(false);
  });

  it("saves over a view of the user's own, and removes it, through the API", async () => {
    const { wrapper, fetch } = await mountContent(
      { documents: [HOME] },
      {},
      null,
      [IMAGES],
    );
    const { views, browser } = services(wrapper);
    await views.select(IMAGES.id);
    browser.query.add({ kind: "literal", key: "text", value: "easter" });
    await flushPromises();
    expect(views.drifted).toBe(true);
    fetch.mockClear();
    await views.save();
    expect(fetch.mock.calls).toEqual([
      [
        `/api/views/content/${IMAGES.id}`,
        {
          method: "PUT",
          body: {
            name: "Images",
            payload: expect.objectContaining({
              sortField: "size",
              clauses: expect.arrayContaining([
                { kind: "literal", key: "text", value: "easter" },
              ]),
            }),
          },
        },
      ],
    ]);
    expect(views.drifted).toBe(false);

    fetch.mockClear();
    await views.remove(IMAGES.id, { force: true });
    await flushPromises();
    expect(fetch.mock.calls[0]).toEqual([
      `/api/views/content/${IMAGES.id}`,
      { method: "DELETE" },
    ]);
    expect(ids(views)).toEqual(["all"]);
    expect(views.active).toBe("all");
  });

  it("sets a view its schema no longer accepts aside, and never applies it", async () => {
    const stale = { ...IMAGES, payload: { sortField: "description" } };
    const { wrapper } = await mountContent({ documents: [HOME] }, {}, null, [
      stale,
    ]);
    const { views } = services(wrapper);
    expect(ids(views)).toEqual(["all"]);
    expect(views.stale).toMatchObject([{ id: IMAGES.id, name: "Images" }]);
    expect(views.drifted).toBe(false);
  });
});

describe("new document dialog", () => {
  const open = async (top: Held = { documents: [HOME] }) => {
    const mounted = await mountContent(top, { "Sermon notes": {} }, ABOUT);
    await mounted.wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    return mounted;
  };

  it("stays shut until a new document is asked for", async () => {
    const { wrapper } = await mountContent({ documents: [HOME] });
    expect(dialogOf(wrapper, DIALOGS.document).props("open")).toBe(false);
    expect(dialogOf(wrapper, DIALOGS.folder).props("open")).toBe(false);
    expect(wrapper.findComponent(ContentEditor).exists()).toBe(false);
    expect(wrapper.findComponent(FolderEditor).exists()).toBe(false);
    expect(document.body.querySelector(".f-dialog-content")).toBeNull();
  });

  it("opens the editor on no record, over the browser, named and described", async () => {
    const { wrapper } = await open();
    const dialog = dialogOf(wrapper, DIALOGS.document);
    expect(dialog.props()).toMatchObject({
      open: true,
      title: "New document",
      description:
        "Created in the current folder. You can add content after saving.",
    });
    const content = document.body.querySelector(".f-dialog-content")!;
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.querySelector(".f-dialog-title")?.textContent?.trim()).toBe(
      "New document",
    );
    expect(dialog.findComponent(ContentEditor).props("record")).toBeNull();
    expect(wrapper.findComponent(Browser).exists()).toBe(true);
    expect(head()).toEqual({ title: "Content" });
  });

  it("shuts from its corner, and opens blank the next time", async () => {
    const { wrapper } = await open();
    const editor = wrapper.findComponent(ContentEditor);
    await editor.find("#content-title").setValue("Membership");
    // The dialog is drawn on the body, outside the page's own element.
    const close = document.body.querySelector<HTMLButtonElement>(
      ".f-dialog-content .content-new-close",
    )!;
    expect(close.getAttribute("aria-label")).toBe("Cancel");
    close.click();
    await flushPromises();
    expect(dialogOf(wrapper, DIALOGS.document).props("open")).toBe(false);
    expect(wrapper.findComponent(ContentEditor).exists()).toBe(false);
    await wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    const title = wrapper.findComponent(ContentEditor).find("#content-title");
    expect((title.element as HTMLInputElement).value).toBe("");
  });

  it("writes the document at the top and leads on to its own page", async () => {
    const { wrapper, fetch } = await open();
    const editor = wrapper.findComponent(ContentEditor);
    expect(editor.props("folder")).toEqual([]);
    await editor.find("#content-title").setValue("About Us");
    await editor.find("#content-slug").setValue("about-us");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith("/content/about-us"),
    );
    expect(writes(fetch)).toEqual([
      [
        "/api/content",
        {
          method: "POST",
          body: { kind: "document", slug: "about-us", title: "About Us" },
        },
      ],
    ]);
  });

  it("files the document in the folder that is open, at the folder's path", async () => {
    at("Sermon notes");
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { "Sermon notes": {} },
      ABOUT,
    );
    await wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    const editor = wrapper.findComponent(ContentEditor);
    expect(editor.props("folder")).toEqual(["Sermon notes"]);
    await editor.find("#content-title").setValue("About Us");
    await editor.find("#content-slug").setValue("about-us");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() => expect(writes(fetch)).toHaveLength(1));
    expect(writes(fetch)[0]).toEqual([
      NOTES_API,
      {
        method: "POST",
        body: { kind: "document", slug: "about-us", title: "About Us" },
      },
    ]);
    await vi.waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith(
        "/content/Sermon%20notes/about-us",
      ),
    );
  });
});

describe("folders", () => {
  it("makes a new folder at the top, and lists the top afresh", async () => {
    const { wrapper, fetch } = await mountContent({ documents: [HOME] });
    await wrapper.find("button.content-new-folder").trigger("click");
    await flushPromises();
    const dialog = dialogOf(wrapper, DIALOGS.folder);
    expect(dialog.props()).toMatchObject({
      open: true,
      title: "New folder",
      description: "Created in the current folder.",
    });
    const editor = wrapper.findComponent(FolderEditor);
    expect(editor.props()).toEqual({ folder: null, parent: [] });
    fetch.mockClear();
    await editor.find("#folder-name").setValue(" Sermon notes ");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.findComponent(FolderEditor).exists()).toBe(false),
    );
    expect(writes(fetch)).toEqual([
      [
        "/api/content",
        { method: "POST", body: { kind: "folder", name: "Sermon notes" } },
      ],
    ]);
    // The top is listed again, the new folder with it.
    expect(fetch).toHaveBeenLastCalledWith("/api/content", { query: {} });
    expect(dialog.props("open")).toBe(false);
  });

  it("makes a new folder inside the folder that is open, at the folder's path", async () => {
    at("Sermon notes");
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { "Sermon notes": {} },
    );
    await wrapper.find("button.content-new-folder").trigger("click");
    await flushPromises();
    const editor = wrapper.findComponent(FolderEditor);
    expect(editor.props("parent")).toEqual(["Sermon notes"]);
    await editor.find("#folder-name").setValue("Romans");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() => expect(writes(fetch)).toHaveLength(1));
    expect(writes(fetch)[0]).toEqual([
      NOTES_API,
      { method: "POST", body: { kind: "folder", name: "Romans" } },
    ]);
  });

  it("refuses a name that is no step of a path, before anything is asked", async () => {
    const { wrapper, fetch } = await mountContent({ documents: [HOME] });
    await wrapper.find("button.content-new-folder").trigger("click");
    await flushPromises();
    const editor = wrapper.findComponent(FolderEditor);
    for (const name of ["Notes/Romans", "..", "."]) {
      await editor.find("#folder-name").setValue(name);
      await editor.find("form").trigger("submit");
      await vi.waitFor(() =>
        expect(editor.find("#folder-name-error").exists(), name).toBe(true),
      );
    }
    expect(writes(fetch)).toEqual([]);
    expect(wrapper.findComponent(FolderEditor).exists()).toBe(true);
  });

  it("renames a folder from its row's actions, at its own path, its name in the form to start from", async () => {
    const { wrapper, fetch } = await mountContent({ folders: [NOTES] });
    await act(wrapper, FOLDER, "Rename");
    const dialog = dialogOf(wrapper, "Rename folder");
    expect(dialog.props()).toMatchObject({
      open: true,
      title: "Rename folder",
      description: "The folder’s contents are not affected.",
    });
    const editor = wrapper.findComponent(FolderEditor);
    expect(editor.props("folder")).toEqual({
      key: "Sermon notes",
      label: "Sermon notes",
      count: 1,
      values: { size: 4096, updatedAt: "2026-10-18T09:30:00.000Z" },
      link: { to: IN_NOTES },
    });
    const name = editor.find("#folder-name");
    expect((name.element as HTMLInputElement).value).toBe("Sermon notes");
    await name.setValue("Notes");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.findComponent(FolderEditor).exists()).toBe(false),
    );
    expect(writes(fetch)).toEqual([
      [NOTES_API, { method: "PUT", body: { name: "Notes" } }],
    ]);
  });

  it("renames a folder inside another under that folder's path", async () => {
    at("Sermon notes");
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { "Sermon notes": { folders: [ROMANS] } },
    );
    await act(wrapper, FOLDER, "Rename");
    const editor = wrapper.findComponent(FolderEditor);
    await editor.find("#folder-name").setValue("Galatians");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() => expect(writes(fetch)).toHaveLength(1));
    expect(writes(fetch)[0]).toEqual([
      "/api/content/Sermon%20notes/Romans",
      { method: "PUT", body: { name: "Galatians" } },
    ]);
  });

  it("drops a rename when its dialog is shut", async () => {
    const { wrapper, fetch } = await mountContent({ folders: [NOTES] });
    await act(wrapper, FOLDER, "Rename");
    document.body
      .querySelector<HTMLButtonElement>(".f-dialog-content .content-new-close")!
      .click();
    await flushPromises();
    expect(wrapper.findComponent(FolderEditor).exists()).toBe(false);
    expect(writes(fetch)).toEqual([]);
    // The next folder dialog is a new folder's, not the rename again.
    await wrapper.find("button.content-new-folder").trigger("click");
    await flushPromises();
    expect(wrapper.findComponent(FolderEditor).props("folder")).toBeNull();
  });

  it("says what went wrong when a folder is not saved, and stays open", async () => {
    const { wrapper, fetch } = await mountContent({ folders: [NOTES] });
    await wrapper.find("button.content-new-folder").trigger("click");
    await flushPromises();
    fetch.mockRejectedValueOnce({
      data: { message: "That name is already in use" },
    });
    const editor = wrapper.findComponent(FolderEditor);
    await editor.find("#folder-name").setValue("Sermon notes");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(editor.find(".content-editor-error").exists()).toBe(true),
    );
    expect(editor.find(".content-editor-error").text()).toBe(
      "That name is already in use",
    );
  });

  it("removes a folder from its row's actions, at its own path, once asked by name", async () => {
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    const { wrapper, fetch } = await mountContent({ folders: [NOTES] });
    await act(wrapper, FOLDER, "Delete");
    await vi.waitFor(() => expect(writes(fetch)).toHaveLength(1));
    expect(confirm).toHaveBeenCalledWith(
      "Delete Sermon notes? This cannot be undone.",
    );
    expect(writes(fetch)[0]).toEqual([NOTES_API, { method: "DELETE" }]);
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/content", { query: {} });
  });

  it("leaves a folder be when the question is answered no", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    );
    const { wrapper, fetch } = await mountContent({ folders: [NOTES] });
    await act(wrapper, FOLDER, "Delete");
    expect(writes(fetch)).toEqual([]);
  });

  it("says why a folder was not removed", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    const { wrapper, fetch } = await mountContent({ folders: [NOTES] });
    fetch.mockRejectedValueOnce({
      data: { message: "The folder is not empty" },
    });
    await act(wrapper, FOLDER, "Delete");
    await vi.waitFor(() =>
      expect(wrapper.find(".content-error").exists()).toBe(true),
    );
    expect(wrapper.find(".content-error").text()).toBe(
      "The folder is not empty",
    );
    expect(wrapper.find(".content-error").attributes("role")).toBe("alert");
  });
});

describe("moving", () => {
  const CONTENT: [Held, Inside] = [
    { folders: [NOTES], documents: [HOME] },
    { "Sermon notes": { folders: [ROMANS] }, "Sermon notes/Romans": {} },
  ];

  /** The button that puts what is held down in the folder that is open. */
  const dropOf = (wrapper: Mounted) => wrapper.find("button.content-move-drop");

  it("holds nothing until a move is asked for", async () => {
    const { wrapper } = await mountContent(...CONTENT);
    expect(wrapper.find(".content-move").exists()).toBe(false);
  });

  it("picks a document up from its row, and puts it down in the folder opened next, by the paths of both", async () => {
    const { wrapper, fetch } = await mountContent(...CONTENT);
    await act(wrapper, POST, "Move");
    const bar = wrapper.find(".content-move");
    expect(bar.attributes("role")).toBe("status");
    expect(bar.find(".content-move-text").text()).toBe(
      "Moving Butte Bible Fellowship. Open the destination folder, then choose Move here.",
    );
    // Where it already is, is nowhere to put it.
    expect(dropOf(wrapper).text()).toBe("Move here");
    expect(dropOf(wrapper).attributes("disabled")).toBeDefined();

    // It is held across the pages: the next folder's still shows it.
    const notes = await go(wrapper, "Sermon notes");
    expect(notes.find(".content-move-text").text()).toBe(
      "Moving Butte Bible Fellowship. Open the destination folder, then choose Move here.",
    );
    expect(dropOf(notes).attributes("disabled")).toBeUndefined();
    await dropOf(notes).trigger("click");
    await vi.waitFor(() =>
      expect(notes.find(".content-move").exists()).toBe(false),
    );
    expect(writes(fetch)).toEqual([
      [
        "/api/content/index",
        { method: "PATCH", body: { parent: ["Sermon notes"] } },
      ],
    ]);
    // The folder is listed again, the document now in it.
    expect(fetch).toHaveBeenLastCalledWith(NOTES_API, { query: {} });
  });

  it("puts a document back at the top: the path of no steps", async () => {
    at("Sermon notes");
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { "Sermon notes": { documents: [ABOUT] } },
    );
    await act(wrapper, POST, "Move");
    const top = await go(wrapper);
    await dropOf(top).trigger("click");
    await vi.waitFor(() => expect(writes(fetch)).toHaveLength(1));
    expect(writes(fetch)[0]).toEqual([
      "/api/content/Sermon%20notes/about-us",
      { method: "PATCH", body: { parent: [] } },
    ]);
  });

  it("picks a folder up from its row, and puts it down inside another, never inside itself or a folder under it", async () => {
    const { wrapper, fetch } = await mountContent(
      { folders: [{ ...ROMANS, parent: undefined }, NOTES] },
      {
        "Sermon notes": {},
        Romans: { folders: [NOTES] },
        "Romans/Sermon notes": {},
      },
    );
    // Folders are listed as the API orders them, by name: Romans first,
    // then the sermon notes.
    await act(wrapper, `${FOLDER}:nth-child(1)`, "Move");
    expect(wrapper.find(".content-move-text").text()).toBe(
      "Moving Romans. Open the destination folder, then choose Move here.",
    );
    expect(dropOf(wrapper).attributes("disabled")).toBeDefined();

    // Inside itself is nowhere to put it, and neither is a folder under it.
    const itself = await go(wrapper, "Romans");
    expect(dropOf(itself).attributes("disabled")).toBeDefined();
    const under = await go(itself, "Romans", "Sermon notes");
    expect(dropOf(under).attributes("disabled")).toBeDefined();

    // A folder of the same name elsewhere is another folder.
    const notes = await go(under, "Sermon notes");
    expect(dropOf(notes).attributes("disabled")).toBeUndefined();
    await dropOf(notes).trigger("click");
    await vi.waitFor(() => expect(writes(fetch)).toHaveLength(1));
    expect(writes(fetch)[0]).toEqual([
      "/api/content/Romans",
      { method: "PATCH", body: { parent: ["Sermon notes"] } },
    ]);
  });

  it("lets go of what it holds, where it was", async () => {
    const { wrapper, fetch } = await mountContent(...CONTENT);
    await act(wrapper, POST, "Move");
    const release = wrapper.find("button.content-move-release");
    expect(release.text()).toBe("Cancel");
    await release.trigger("click");
    expect(wrapper.find(".content-move").exists()).toBe(false);
    expect(writes(fetch)).toEqual([]);
  });

  it("says why a move was refused, and keeps hold", async () => {
    const { wrapper, fetch } = await mountContent(...CONTENT);
    await act(wrapper, POST, "Move");
    const notes = await go(wrapper, "Sermon notes");
    fetch.mockRejectedValueOnce({
      data: { message: "The folder no longer exists" },
    });
    await dropOf(notes).trigger("click");
    await vi.waitFor(() =>
      expect(notes.find(".content-error").exists()).toBe(true),
    );
    expect(notes.find(".content-error").text()).toBe(
      "The folder no longer exists",
    );
    expect(notes.find(".content-move").exists()).toBe(true);
  });
});

describe("selection", () => {
  const BAR = ".f-data-browser-bulk-actions";
  const COUNT = ".f-data-browser-bulk-actions-count";

  /** Ticks each row given, folders first, by the box its row leads with. */
  const select = async (wrapper: Mounted, ...rows: number[]) => {
    const boxes = wrapper.findAll(
      ".f-tbody .f-data-browser-select [role=checkbox]",
    );
    for (const row of rows) await boxes[row]!.trigger("click");
  };

  /** Presses a button of the bar over the selection, by its label. */
  const press = (wrapper: Mounted, label: string) =>
    wrapper
      .findAll(`${BAR} button`)
      .find((button) => button.text() === label)!
      .trigger("click");

  it("offers nothing over the rows until one is selected, then how many are, and their removal", async () => {
    const { wrapper } = await mountContent({
      folders: [NOTES],
      documents: [HOME, ABOUT],
    });
    expect(wrapper.find(BAR).exists()).toBe(false);
    await select(wrapper, 0, 1);
    expect(wrapper.find(COUNT).text()).toBe("2 selected");
    expect(
      wrapper.findAll(`${BAR} button`).map((button) => button.text()),
    ).toEqual(["Delete", "Clear"]);
  });

  it("removes the documents and folders selected, each at its own path, once asked by their count, and lists the folder afresh with none selected", async () => {
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    const { wrapper, fetch } = await mountContent({
      folders: [NOTES],
      documents: [HOME, ABOUT],
    });
    const listing = fetch.getMockImplementation()!;
    await select(wrapper, 0, 1, 2);
    // What was removed is gone from what the folder lists next.
    fetch.mockImplementation(async (path, request) =>
      request?.method === undefined && path === "/api/content"
        ? folder({})
        : listing(path, request),
    );
    await press(wrapper, "Delete");
    await flushPromises();
    expect(confirm).toHaveBeenCalledWith(
      "Delete 3 items? This cannot be undone.",
    );
    expect(writes(fetch)).toEqual([
      ["/api/content/index", { method: "DELETE" }],
      ["/api/content/about-us", { method: "DELETE" }],
      [NOTES_API, { method: "DELETE" }],
    ]);
    expect(fetch).toHaveBeenLastCalledWith("/api/content", { query: {} });
    expect(wrapper.find(BAR).exists()).toBe(false);
    expect(wrapper.find(".content-error").exists()).toBe(false);
  });

  it("removes what is selected in a folder under the folder's path", async () => {
    vi.stubGlobal("confirm", () => true);
    at("Sermon notes");
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { "Sermon notes": { folders: [ROMANS], documents: [ABOUT] } },
    );
    await select(wrapper, 0, 1);
    await press(wrapper, "Delete");
    await flushPromises();
    expect(writes(fetch)).toEqual([
      ["/api/content/Sermon%20notes/about-us", { method: "DELETE" }],
      ["/api/content/Sermon%20notes/Romans", { method: "DELETE" }],
    ]);
  });

  it("asks about one as one, and keeps it when the question is declined", async () => {
    const confirm = vi.fn(() => false);
    vi.stubGlobal("confirm", confirm);
    const { wrapper, fetch } = await mountContent({ documents: [HOME, ABOUT] });
    await select(wrapper, 1);
    await press(wrapper, "Delete");
    await flushPromises();
    expect(confirm).toHaveBeenCalledWith(
      "Delete 1 item? This cannot be undone.",
    );
    expect(writes(fetch)).toEqual([]);
    expect(wrapper.find(COUNT).text()).toBe("1 selected");
  });

  it("says why one was not removed and keeps it selected, the rest removed", async () => {
    vi.stubGlobal("confirm", () => true);
    const { wrapper, fetch } = await mountContent({
      folders: [NOTES],
      documents: [HOME],
    });
    const listing = fetch.getMockImplementation()!;
    await select(wrapper, 0, 1);
    fetch.mockImplementation(async (path, request) => {
      if (path === NOTES_API && request?.method === "DELETE") {
        throw { data: { message: "The folder is not empty" } };
      }
      // The document went; the folder that was refused is still listed.
      if (path === "/api/content" && request?.method === undefined) {
        return folder({ folders: [NOTES] });
      }
      return listing(path, request);
    });
    await press(wrapper, "Delete");
    await flushPromises();
    expect(writes(fetch)).toHaveLength(2);
    expect(wrapper.find(".content-error").text()).toBe(
      "The folder is not empty",
    );
    expect(wrapper.find(COUNT).text()).toBe("1 selected");
    expect(
      wrapper.findAll(".f-tbody .f-tr.f-data-browser-selected"),
    ).toHaveLength(1);
    expect(wrapper.find(`${FOLDER}.f-data-browser-selected`).exists()).toBe(
      true,
    );
  });

  it("counts one already gone as removed", async () => {
    vi.stubGlobal("confirm", () => true);
    const { wrapper, fetch } = await mountContent({ documents: [HOME] });
    await select(wrapper, 0);
    fetch.mockImplementation(async (_path, request) => {
      if (request?.method !== undefined) throw { status: 404 };
      return folder({});
    });
    await press(wrapper, "Delete");
    await flushPromises();
    expect(writes(fetch)).toEqual([
      ["/api/content/index", { method: "DELETE" }],
    ]);
    expect(wrapper.find(".content-error").exists()).toBe(false);
    expect(wrapper.find(BAR).exists()).toBe(false);
  });
});

describe("a document's page", () => {
  /** The home page at the top, and About Us filed in the notes. */
  const CONTENT: [Held, Inside] = [
    { folders: [NOTES], documents: [HOME] },
    { "Sermon notes": { documents: [ABOUT] } },
  ];

  /** The page of the document at a path, over what the API holds. */
  const mountDocument = async (path: string[], answer?: unknown) => {
    at(...path);
    return mountContent(CONTENT[0], CONTENT[1], answer);
  };

  it("edits the document the address names, read in the one request of its path, under a header that names it", async () => {
    const { wrapper, fetch } = await mountDocument(["index"]);
    expect(wrapper.findComponent(ContentDocument).props()).toEqual({
      record: HOME,
      folder: [],
    });
    expect(wrapper.findComponent(ContentFolder).exists()).toBe(false);
    expect(wrapper.findComponent(Browser).exists()).toBe(false);
    expect(reads(fetch)).toEqual([["/api/content/index", { query: {} }]]);
    const header = wrapper.findComponent(PageHeader);
    expect(header.props()).toMatchObject({
      title: "Butte Bible Fellowship",
      description: "A local church in Chico.",
      back: { label: "Content", to: "/content", icon: "chevron-left" },
    });
    expect(header.find("a.page-header-back").attributes("href")).toBe(
      "/content",
    );
    expect(header.findComponent(ContentMenu).props()).toEqual({
      record: HOME,
      folder: [],
    });
    expect(head()).toEqual({ title: "Butte Bible Fellowship" });
  });

  it("leads back to the folder the document is filed in, named as the trail names it, and writes it under that folder's path", async () => {
    const { wrapper } = await mountDocument(["Sermon notes", "about-us"]);
    expect(wrapper.findComponent(ContentDocument).props()).toEqual({
      record: ABOUT,
      folder: ["Sermon notes"],
    });
    const header = wrapper.findComponent(PageHeader);
    expect(header.props("back")).toEqual({
      label: "Sermon notes",
      to: IN_NOTES,
      icon: "chevron-left",
    });
    expect(header.findComponent(ContentMenu).props("folder")).toEqual([
      "Sermon notes",
    ]);
    expect(wrapper.findComponent(ContentEditor).props()).toEqual({
      record: ABOUT,
      folder: ["Sermon notes"],
    });
    expect(wrapper.findComponent(ContentBody).props("address")).toBe(
      "/api/content/Sermon%20notes/about-us",
    );
  });

  it("offers the document's own pages as tabs, the document itself the first and only one, at its own address, lit when read", async () => {
    const { wrapper } = await mountDocument(["Sermon notes", "about-us"]);
    expect(wrapper.findComponent(PageHeader).props("tabs")).toEqual([
      { label: "Document", to: "/content/Sermon%20notes/about-us" },
    ]);
    const tabs = wrapper.findAll(".page-header-tabs .f-tabs-trigger");
    expect(tabs.map((tab) => [tab.element.tagName, tab.text()])).toEqual([
      ["A", "Document"],
    ]);
    expect(tabs[0]?.attributes("href")).toBe(
      "/content/Sermon%20notes/about-us",
    );
    expect(tabs[0]?.attributes("data-state")).toBe("active");
  });

  it("names the document afresh once its metadata is saved", async () => {
    const { wrapper } = await mountDocument(["index"]);
    wrapper.findComponent(ContentEditor).vm.$emit("saved", {
      ...HOME,
      title: "Welcome",
      description: "Come as you are.",
    });
    await flushPromises();
    expect(wrapper.find(".page-header-title").text()).toBe("Welcome");
    expect(wrapper.find(".page-header-description").text()).toBe(
      "Come as you are.",
    );
    expect(head()).toEqual({ title: "Welcome" });
  });

  it("describes the document by its description, or not at all", async () => {
    const { wrapper } = await mountDocument(["Sermon notes", "about-us"]);
    expect(wrapper.find(".page-header-title").text()).toBe("About Us");
    expect(wrapper.find(".page-header-description").exists()).toBe(false);
  });

  it("throws a 404 where a folder holds no document of the name", async () => {
    at("Sermon notes", "index");
    const fetch = api(...CONTENT);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, error } = await visit();
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Folder or document not found",
    });
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("leaves the browser where it stands: the folder come back to is as it was left", async () => {
    at("Sermon notes");
    const { wrapper, fetch } = await mountContent(...CONTENT);
    browserOf(wrapper).query.add({
      kind: "literal",
      key: "text",
      value: "about",
    });
    await flushPromises();
    const document = await go(wrapper, "Sermon notes", "about-us");
    expect(document.findComponent(ContentDocument).exists()).toBe(true);
    fetch.mockClear();
    const back = await go(document, "Sermon notes");
    expect(browserOf(back).pathKeys).toEqual(["Sermon notes"]);
    expect(reads(fetch)).toEqual([[NOTES_API, { query: { q: "about" } }]]);
  });

  it("lays the document out in two panels: its metadata, then what is written on it", async () => {
    const { wrapper } = await mountDocument(["index"]);
    const panels = wrapper.find(".content-page").element.children;
    expect([...panels].map((panel) => panel.className)).toEqual([
      "content-page-side",
      "content-body",
      "save-bar",
    ]);
    expect(wrapper.find(".content-page-side > .content-editor").exists()).toBe(
      true,
    );
    expect(wrapper.findComponent(ContentEditor).props("record")).toEqual(HOME);
    expect(wrapper.findComponent(ContentBody).props("record")).toEqual(HOME);
    expect(wrapper.find(".content-editor-title").text()).toBe("Metadata");
    expect(wrapper.find(".content-body-title").text()).toBe("Content");
  });

  it("lists the document's headings under its metadata, each linked to its own", async () => {
    const body = {
      type: "root" as const,
      children: [
        {
          type: "element" as const,
          tagName: "h2",
          properties: {},
          children: [{ type: "text" as const, value: "Our Vision" }],
        },
        {
          type: "element" as const,
          tagName: "p",
          properties: {},
          children: [{ type: "text" as const, value: "Modern wisdom…" }],
        },
      ],
    };
    at("index");
    const { wrapper } = await mountContent({
      documents: [{ ...HOME, body }],
    });
    await wrapper.vm.$nextTick();
    const link = wrapper.find(
      ".content-page-side > .content-editor + nav.toc a.toc-link",
    );
    expect(link.text()).toBe("Our Vision");
    expect(link.attributes("href")).toBe("#our-vision");
    expect(wrapper.find(".content-body h2#our-vision").exists()).toBe(true);
  });

  it("lists nothing under the metadata of a document with no headings", async () => {
    const { wrapper } = await mountDocument(["index"]);
    await wrapper.vm.$nextTick();
    expect(wrapper.find("nav.toc").exists()).toBe(false);
  });

  /** The document's page, with its bar's two buttons. */
  const mountWhole = async (path: string[], answer?: unknown) => {
    const { wrapper, fetch } = await mountDocument(path, answer);
    return {
      wrapper,
      fetch,
      save: wrapper.find("button.save-bar-save"),
      reset: wrapper.find("button.save-bar-reset"),
      content: () => wrapper.find(".content-body .f-data-editor-content"),
    };
  };

  type Whole = Awaited<ReturnType<typeof mountWhole>>;

  /** Writes over the whole of what is written, as typing over a selection does. */
  const write = async (page: Whole, text: string) => {
    await page.content().trigger("pointerdown");
    await page.wrapper.vm.$nextTick();
    page.wrapper
      .findComponent(ContentBody)
      .findComponent(Editor)
      .props("service")
      .run(
        (chain: {
          selectAll: () => { insertContent: (text: string) => unknown };
        }) => chain.selectAll().insertContent(text),
      );
    await page.wrapper.vm.$nextTick();
  };

  it("ends in one bar that saves the whole record, with nothing to do until something changes, and no button in either panel", async () => {
    const { wrapper, save, reset } = await mountWhole(["index"]);
    expect(wrapper.findAll("button.save-bar-save")).toHaveLength(1);
    expect(wrapper.findComponent(SaveBar).props()).toEqual({
      dirty: false,
      open: false,
      saving: false,
      errors: [],
    });
    expect(save.attributes("disabled")).toBeDefined();
    expect(reset.attributes("disabled")).toBeDefined();
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false);
    expect(
      wrapper.findAll("button").filter((b) => b.text() === "Save"),
    ).toHaveLength(1);
  });

  it("saves the details and what is written together, both at the document's path: what is written first, then the metadata", async () => {
    const changed = { ...HOME, title: "Welcome" };
    const page = await mountWhole(["index"], changed);
    await page.wrapper.find("#content-title").setValue("Welcome");
    await write(page, "Since 2010.");
    expect(page.save.attributes("disabled")).toBeUndefined();
    await page.save.trigger("click");
    await flushPromises();
    expect(writes(page.fetch)).toEqual([
      [
        "/api/content/index",
        {
          method: "PATCH",
          body: { body: expect.objectContaining({ type: "root" }) },
        },
      ],
      [
        "/api/content/index",
        { method: "PUT", body: expect.objectContaining({ title: "Welcome" }) },
      ],
    ]);
    expect(page.wrapper.find(".page-header-title").text()).toBe("Welcome");
    expect(useRouter().replace).not.toHaveBeenCalled();
    expect(page.save.attributes("disabled")).toBeDefined();
    expect(page.reset.attributes("disabled")).toBeDefined();
  });

  it("follows a document whose slug changed to its new address, once all of it is written at the old one", async () => {
    const moved = { ...ABOUT, slug: "who-we-are" };
    const page = await mountWhole(["Sermon notes", "about-us"], moved);
    await page.wrapper.find("#content-slug").setValue("who-we-are");
    await write(page, "Since 2010.");
    await page.save.trigger("click");
    await flushPromises();
    expect(
      writes(page.fetch).map(([path, request]) => [path, request?.method]),
    ).toEqual([
      ["/api/content/Sermon%20notes/about-us", "PATCH"],
      ["/api/content/Sermon%20notes/about-us", "PUT"],
    ]);
    expect(useRouter().replace).toHaveBeenCalledWith(
      "/content/Sermon%20notes/who-we-are",
    );
  });

  it("leaves the metadata unwritten, and the document where it is, when what is written was not saved", async () => {
    const page = await mountWhole(["index"], { ...HOME, slug: "welcome" });
    await page.wrapper.find("#content-slug").setValue("welcome");
    await write(page, "Since 2010.");
    page.fetch.mockRejectedValueOnce(new Error("The server is away."));
    await page.save.trigger("click");
    await flushPromises();
    expect(writes(page.fetch).map(([, request]) => request?.method)).toEqual([
      "PATCH",
    ]);
    expect(useRouter().replace).not.toHaveBeenCalled();
    expect(
      page.wrapper.findAll(".save-bar-error").map((error) => error.text()),
    ).toEqual(["The server is away."]);
    expect(page.save.attributes("disabled")).toBeUndefined();
  });

  it("saves only the panel that changed", async () => {
    const page = await mountWhole(["index"], HOME);
    await write(page, "Since 2010.");
    await page.save.trigger("click");
    await flushPromises();
    expect(writes(page.fetch)).toEqual([
      ["/api/content/index", expect.objectContaining({ method: "PATCH" })],
    ]);
  });

  it("resets the details and what is written at once, to what was last saved", async () => {
    const page = await mountWhole(["index"], HOME);
    const field = page.wrapper.find("#content-title");
    await field.setValue("Welcome");
    await write(page, "A slip of the keys.");
    expect(page.reset.attributes("disabled")).toBeUndefined();
    await page.reset.trigger("click");
    await flushPromises();
    expect(writes(page.fetch)).toEqual([]);
    expect((field.element as HTMLInputElement).value).toBe(
      "Butte Bible Fellowship",
    );
    expect(page.content().text()).toBe("Has served since 2010.");
    expect(page.content().attributes("contenteditable")).toBeUndefined();
    expect(page.save.attributes("disabled")).toBeDefined();
    expect(page.reset.attributes("disabled")).toBeDefined();
  });

  it("says in the bar what went wrong with a save, and keeps what was written to try again", async () => {
    const page = await mountWhole(["index"]);
    page.fetch.mockRejectedValue(new Error("The server is away."));
    await page.wrapper.find("#content-title").setValue("Welcome");
    await page.save.trigger("click");
    await flushPromises();
    const errors = page.wrapper.findAll(".save-bar-error");
    expect(errors.map((error) => error.text())).toEqual([
      "The server is away.",
    ]);
    expect(page.save.attributes("disabled")).toBeUndefined();
  });
});
