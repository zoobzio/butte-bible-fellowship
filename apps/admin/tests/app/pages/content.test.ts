import type {
  ContentRecord,
  FolderRecord,
  ViewRecord,
} from "@bbf/schema/types";

import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { Browser, Dialog, Editor, NuxtPage, Views } from "#components";
import { setRoutePath, useRouter } from "#imports";
import ContentBody from "~/components/ContentBody.vue";
import ContentEditor from "~/components/ContentEditor.vue";
import ContentMenu from "~/components/ContentMenu.vue";
import FolderEditor from "~/components/FolderEditor.vue";
import PageHeader from "~/components/PageHeader.vue";
import SaveBar from "~/components/SaveBar.vue";
import Index from "~/pages/content/index.vue";
import Content from "~/pages/content/[id].vue";
import Page from "~/pages/content/[id]/page.vue";
import { HOME, ABOUT, NOTES, ROMANS } from "#test/support/records";
import { head } from "#test/support/head";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

type Request = { method?: string; query?: Record<string, unknown> };

/** What one folder holds: the folders inside it, and the documents filed in it. */
type Held = { folders?: FolderRecord[]; documents?: ContentRecord[] };

/** A view of the content someone saved: the images, the largest first. */
const IMAGES: ViewRecord = {
  id: "0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f",
  surface: "content",
  name: "Images",
  payload: {
    sortField: "size",
    sortDirection: "desc",
    entries: [
      { kind: "filter", key: "mime", op: "starts with", value: "image/" },
    ],
  },
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

/**
 * The admin's API over the content: the top holds `top`, and each folder what
 * `inside` gives under its id. Every write answers with `answer`, and the
 * views whoever is signed in has saved are `saved`.
 */
const api = (
  top: Held,
  inside: Record<number, Held> = {},
  answer?: unknown,
  saved: ViewRecord[] = [],
) =>
  vi.fn(async (path: string, request: Request = {}) => {
    if (request.method !== undefined) return answer;
    if (path.startsWith("/api/views/")) return saved;
    if (path === "/api/content/folders") {
      const parent = request.query?.parent as number | undefined;
      return (parent === undefined ? top : inside[parent])?.folders ?? [];
    }
    const folder = request.query?.folder as number | undefined;
    return (folder === undefined ? top : inside[folder])?.documents ?? [];
  });

/** The content page over the admin's API holding what is given. */
const mountContent = async (
  top: Held,
  inside: Record<number, Held> = {},
  answer?: unknown,
  saved: ViewRecord[] = [],
) => {
  const fetch = api(top, inside, answer, saved);
  vi.stubGlobal("$fetch", fetch);
  const { wrapper, error } = await mountSuspended(Index);
  expect(error).toBeUndefined();
  return { wrapper, fetch };
};

type Mounted = Awaited<ReturnType<typeof mountContent>>["wrapper"];

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
const act = async (
  wrapper: Awaited<ReturnType<typeof mountContent>>["wrapper"],
  row: string,
  label: string,
) => {
  const trigger = wrapper.find(`${row} .f-data-browser-actions button`);
  await trigger.trigger("pointerdown", { button: 0, ctrlKey: false });
  await trigger.trigger("click");
  await flushPromises();
  await pick(label);
};

const FOLDER = ".f-data-browser-folder";
const POST = ".f-data-browser-files .f-tr";

describe("content page", () => {
  it("heads the content browser with the ways to a new document and a new folder, the top fetched on load", async () => {
    const { wrapper, fetch } = await mountContent({
      folders: [NOTES],
      documents: [HOME, ABOUT],
    });
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: "Content",
      description:
        "The documents written here, in folders of your own making: what each says, and what search engines show for it.",
      action: "New document",
    });
    expect(wrapper.find("button.content-new-folder").text()).toBe("New folder");
    const browser = wrapper.findComponent(Browser);
    expect(browser.props("service").id).toBe("content");
    // The views load first, so the browser's one listing reads the open one.
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls[0]).toEqual(["/api/views/content", {}]);
    expect(fetch).toHaveBeenCalledWith("/api/content/folders", { query: {} });
    expect(fetch).toHaveBeenCalledWith("/api/content", { query: {} });
    expect(browser.props("service").files).toEqual([HOME, ABOUT]);
    expect(browser.props("service").folders).toEqual([
      {
        key: "2",
        label: "Sermon notes",
        count: 1,
        values: { size: 4096, updatedAt: "2026-10-18T09:30:00.000Z" },
      },
    ]);
    expect(head()).toEqual({ title: "Content" });
  });

  it("lists the folders first, each with what it holds, then the documents, each title the way to its editor", async () => {
    const { wrapper } = await mountContent({
      folders: [NOTES],
      documents: [HOME, ABOUT],
    });
    expect(wrapper.find(".f-data-browser table").exists()).toBe(true);
    const folders = wrapper.findAll(`${FOLDER} .f-data-browser-folder-btn`);
    expect(folders.map((folder) => folder.text())).toEqual(["Sermon notes1"]);
    const links = wrapper.findAll(`${POST} .f-td > a.f-anchor`);
    expect(links.map((link) => link.attributes("href"))).toEqual([
      "/content/5/page",
      "/content/6/page",
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
    // Its name and its count, nothing under the slug or the type, then
    // its size and the day.
    expect(cells).toEqual([
      "Sermon notes1",
      "",
      "",
      "4 kB",
      expect.stringContaining("Oct 18, 2026"),
    ]);
  });

  it("names the top of the trail after the content", async () => {
    const { wrapper } = await mountContent({ documents: [HOME] });
    expect(wrapper.find(".f-data-browser-breadcrumb").text()).toBe("Content");
  });

  it("opens a folder when it is clicked: what it holds is fetched, and the trail leads back", async () => {
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES], documents: [HOME] },
      { 2: { folders: [ROMANS], documents: [ABOUT] } },
    );
    await wrapper.find(`${FOLDER} .f-data-browser-folder-btn`).trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/content", {
      query: { folder: 2 },
    });
    expect(fetch).toHaveBeenCalledWith("/api/content/folders", {
      query: { parent: 2 },
    });
    expect(
      wrapper
        .findAll(`${FOLDER} .f-data-browser-folder-btn`)
        .map((f) => f.text()),
    ).toEqual(["Romans0"]);
    expect(
      wrapper.findAll(`${POST} a.f-anchor`).map((link) => link.text()),
    ).toEqual(["About Us"]);
    const crumbs = wrapper.findAll(".f-data-browser-breadcrumb .f-li");
    expect(crumbs.map((crumb) => crumb.text())).toEqual([
      "Content",
      "Sermon notes",
    ]);

    // A folder inside a folder opens the same way, a level deeper.
    await wrapper.find(`${FOLDER} .f-data-browser-folder-btn`).trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/content", {
      query: { folder: 3 },
    });
    expect(wrapper.findComponent(Browser).props("service").pathKeys).toEqual([
      "2",
      "3",
    ]);

    // The trail's first crumb leads back to the top.
    await wrapper.find(".f-data-browser-breadcrumb button").trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/content", { query: {} });
    expect(
      wrapper.findAll(`${POST} a.f-anchor`).map((link) => link.text()),
    ).toEqual(["Butte Bible Fellowship"]);
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
    const { query } = wrapper.findComponent(Browser).props("service");
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

  it("searches the open folder by the text and the filters the search commits: its documents by both, its folders by the text", async () => {
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { 2: { documents: [HOME] } },
    );
    const { query } = wrapper.findComponent(Browser).props("service");
    await wrapper.find(`${FOLDER} .f-data-browser-folder-btn`).trigger("click");
    await flushPromises();
    query.add({ kind: "literal", key: "text", value: "fellowship" });
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/content", {
      query: { folder: 2, q: "fellowship" },
    });
    expect(fetch).toHaveBeenCalledWith("/api/content/folders", {
      query: { parent: 2, q: "fellowship" },
    });
    query.setDraft("Title: butte");
    query.submit();
    query.add({
      kind: "filter",
      key: "updatedAt",
      op: "on or after",
      value: "2026-10-01",
    });
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/content", {
      query: {
        folder: 2,
        q: "fellowship",
        titleContains: "butte",
        updatedAtOnOrAfter: "2026-10-01",
      },
    });
    expect(fetch).toHaveBeenCalledWith("/api/content/folders", {
      query: { parent: 2, q: "fellowship" },
    });
  });

  it("drops the search on leaving the folder it was typed in, and says when one finds nothing", async () => {
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { 2: {} },
    );
    const browser = wrapper.findComponent(Browser).props("service");
    await wrapper.find(`${FOLDER} .f-data-browser-folder-btn`).trigger("click");
    await flushPromises();
    browser.query.add({ kind: "literal", key: "text", value: "nothing" });
    await flushPromises();
    expect(browser.isFiltered).toBe(true);
    expect(wrapper.find("tbody.f-data-browser-empty .f-td").text()).toBe(
      "No matches",
    );
    await wrapper.find(".f-data-browser-breadcrumb button").trigger("click");
    await flushPromises();
    expect(browser.isFiltered).toBe(false);
    expect(fetch).toHaveBeenLastCalledWith("/api/content", { query: {} });
  });

  it("sorts the documents by a column the sort menu offers, and the other way on a second ask", async () => {
    const { wrapper, fetch } = await mountContent({ documents: [HOME, ABOUT] });
    const browser = wrapper.findComponent(Browser).props("service");
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
    // A folder has no slug to be sorted by: the folders stay by name.
    expect(fetch).toHaveBeenCalledWith("/api/content/folders", { query: {} });
  });

  it("sorts the folders with the documents where a folder shows something under the column, by its name under the title", async () => {
    const { wrapper, fetch } = await mountContent({
      folders: [NOTES],
      documents: [HOME],
    });
    const browser = wrapper.findComponent(Browser).props("service");
    browser.sortBy("size");
    await flushPromises();
    expect(fetch).toHaveBeenCalledWith("/api/content", {
      query: { sort: "size", direction: "asc" },
    });
    expect(fetch).toHaveBeenCalledWith("/api/content/folders", {
      query: { sort: "size", direction: "asc" },
    });
    browser.sortBy("updatedAt");
    await flushPromises();
    expect(fetch).toHaveBeenCalledWith("/api/content/folders", {
      query: { sort: "updatedAt", direction: "asc" },
    });
    browser.sortBy("title");
    browser.sortBy("title");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/content", {
      query: { sort: "title", direction: "desc" },
    });
    expect(fetch).toHaveBeenCalledWith("/api/content/folders", {
      query: { sort: "name", direction: "desc" },
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

  it("leads to a document's editor from its row's actions", async () => {
    const { wrapper } = await mountContent({ documents: [HOME] });
    await act(wrapper, POST, "Edit");
    const { navigateTo } = await import("#imports");
    expect(navigateTo).toHaveBeenCalledWith("/content/5/page");
  });
});

describe("content views", () => {
  const services = (wrapper: Mounted) => ({
    views: wrapper.findComponent(Views).props("service"),
    browser: wrapper.findComponent(Browser).props("service"),
  });

  const ids = (views: { views: { id: string }[] }) =>
    views.views.map((view) => view.id);

  /** The reads of the content the API was asked for, the folders' left out. */
  const listed = (fetch: ReturnType<typeof api>) =>
    fetch.mock.calls.filter(([path]) => path === "/api/content");

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
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { 2: { documents: [HOME] } },
      null,
      [IMAGES],
    );
    const { views, browser } = services(wrapper);
    await wrapper.find(`${FOLDER} .f-data-browser-folder-btn`).trigger("click");
    await flushPromises();
    fetch.mockClear();
    expect(await views.select(IMAGES.id)).toBe(true);
    await flushPromises();
    expect(listed(fetch)).toEqual([
      [
        "/api/content",
        {
          query: {
            folder: 2,
            mimeStartsWith: "image/",
            sort: "size",
            direction: "desc",
          },
        },
      ],
    ]);
    expect(fetch).toHaveBeenCalledWith("/api/content/folders", {
      query: { parent: 2, sort: "size", direction: "desc" },
    });
    expect(browser.pathKeys).toEqual(["2"]);
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
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { 2: { documents: [HOME] } },
    );
    const { views, browser } = services(wrapper);
    await wrapper.find(`${FOLDER} .f-data-browser-folder-btn`).trigger("click");
    await flushPromises();
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
              entries: [{ kind: "literal", key: "text", value: "fellowship" }],
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
              entries: expect.arrayContaining([
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
    const mounted = await mountContent(top, { 2: {} }, ABOUT);
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
        "Its metadata comes first, and it is filed in the folder that is open. What is written on it is added on its own page, once it is saved.",
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
    expect(editor.props("folder")).toBeUndefined();
    await editor.find("#content-title").setValue("About Us");
    await editor.find("#content-slug").setValue("about-us");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith("/content/6/page"),
    );
    expect(writes(fetch)).toEqual([
      [
        "/api/content",
        { method: "POST", body: { slug: "about-us", title: "About Us" } },
      ],
    ]);
  });

  it("files the document in the folder that is open", async () => {
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { 2: {} },
      ABOUT,
    );
    await wrapper.find(`${FOLDER} .f-data-browser-folder-btn`).trigger("click");
    await flushPromises();
    await wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    const editor = wrapper.findComponent(ContentEditor);
    expect(editor.props("folder")).toBe(2);
    await editor.find("#content-title").setValue("About Us");
    await editor.find("#content-slug").setValue("about-us");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() => expect(writes(fetch)).toHaveLength(1));
    expect(writes(fetch)[0]).toEqual([
      "/api/content",
      {
        method: "POST",
        body: { slug: "about-us", title: "About Us", folder: 2 },
      },
    ]);
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
      description: "It is made inside the folder that is open.",
    });
    const editor = wrapper.findComponent(FolderEditor);
    expect(editor.props()).toEqual({ folder: null, parent: undefined });
    fetch.mockClear();
    await editor.find("#folder-name").setValue(" Sermon notes ");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.findComponent(FolderEditor).exists()).toBe(false),
    );
    expect(writes(fetch)).toEqual([
      [
        "/api/content/folders",
        { method: "POST", body: { name: "Sermon notes" } },
      ],
    ]);
    // The top is listed again, the new folder with it.
    expect(fetch).toHaveBeenLastCalledWith("/api/content", { query: {} });
    expect(dialog.props("open")).toBe(false);
  });

  it("makes a new folder inside the folder that is open", async () => {
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { 2: {} },
    );
    await wrapper.find(`${FOLDER} .f-data-browser-folder-btn`).trigger("click");
    await flushPromises();
    await wrapper.find("button.content-new-folder").trigger("click");
    await flushPromises();
    const editor = wrapper.findComponent(FolderEditor);
    expect(editor.props("parent")).toBe(2);
    await editor.find("#folder-name").setValue("Romans");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() => expect(writes(fetch)).toHaveLength(1));
    expect(writes(fetch)[0]).toEqual([
      "/api/content/folders",
      { method: "POST", body: { name: "Romans", parent: 2 } },
    ]);
  });

  it("renames a folder from its row's actions, its name in the form to start from", async () => {
    const { wrapper, fetch } = await mountContent({ folders: [NOTES] });
    await act(wrapper, FOLDER, "Rename");
    const dialog = dialogOf(wrapper, "Rename folder");
    expect(dialog.props()).toMatchObject({
      open: true,
      title: "Rename folder",
      description: "It stays where it is, with everything in it.",
    });
    const editor = wrapper.findComponent(FolderEditor);
    expect(editor.props("folder")).toEqual({
      key: "2",
      label: "Sermon notes",
      count: 1,
      values: { size: 4096, updatedAt: "2026-10-18T09:30:00.000Z" },
    });
    const name = editor.find("#folder-name");
    expect((name.element as HTMLInputElement).value).toBe("Sermon notes");
    await name.setValue("Notes");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.findComponent(FolderEditor).exists()).toBe(false),
    );
    expect(writes(fetch)).toEqual([
      ["/api/content/folders/2", { method: "PUT", body: { name: "Notes" } }],
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
      data: { message: "A folder here already has that name" },
    });
    const editor = wrapper.findComponent(FolderEditor);
    await editor.find("#folder-name").setValue("Sermon notes");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(editor.find(".content-editor-error").exists()).toBe(true),
    );
    expect(editor.find(".content-editor-error").text()).toBe(
      "A folder here already has that name",
    );
  });

  it("removes a folder from its row's actions, once asked by name", async () => {
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    const { wrapper, fetch } = await mountContent({ folders: [NOTES] });
    await act(wrapper, FOLDER, "Delete");
    await vi.waitFor(() => expect(writes(fetch)).toHaveLength(1));
    expect(confirm).toHaveBeenCalledWith(
      "Delete Sermon notes? This cannot be undone.",
    );
    expect(writes(fetch)[0]).toEqual([
      "/api/content/folders/2",
      { method: "DELETE" },
    ]);
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
  const CONTENT: [Held, Record<number, Held>] = [
    { folders: [NOTES], documents: [HOME] },
    { 2: { folders: [ROMANS] }, 3: {} },
  ];

  const enter = async (
    wrapper: Awaited<ReturnType<typeof mountContent>>["wrapper"],
  ) => {
    await wrapper.find(`${FOLDER} .f-data-browser-folder-btn`).trigger("click");
    await flushPromises();
  };

  it("holds nothing until a move is asked for", async () => {
    const { wrapper } = await mountContent(...CONTENT);
    expect(wrapper.find(".content-move").exists()).toBe(false);
  });

  it("picks a document up from its row, and puts it down in the folder opened next", async () => {
    const { wrapper, fetch } = await mountContent(...CONTENT);
    await act(wrapper, POST, "Move");
    const bar = wrapper.find(".content-move");
    expect(bar.attributes("role")).toBe("status");
    expect(bar.find(".content-move-text").text()).toBe(
      "Moving Butte Bible Fellowship. Open the folder it belongs in.",
    );
    // Where it already is, is nowhere to put it.
    const drop = bar.find("button.content-move-drop");
    expect(drop.text()).toBe("Move here");
    expect(drop.attributes("disabled")).toBeDefined();

    await enter(wrapper);
    expect(drop.attributes("disabled")).toBeUndefined();
    await drop.trigger("click");
    await vi.waitFor(() =>
      expect(wrapper.find(".content-move").exists()).toBe(false),
    );
    expect(writes(fetch)).toEqual([
      ["/api/content/5/folder", { method: "PATCH", body: { folder: 2 } }],
    ]);
    // The folder is listed again, the document now in it.
    expect(fetch).toHaveBeenLastCalledWith("/api/content", {
      query: { folder: 2 },
    });
  });

  it("puts a document back at the top: no folder is named", async () => {
    const { wrapper, fetch } = await mountContent(
      { folders: [NOTES] },
      { 2: { documents: [{ ...ABOUT, folder: 2 }] } },
    );
    await enter(wrapper);
    await act(wrapper, POST, "Move");
    await wrapper.find(".f-data-browser-breadcrumb button").trigger("click");
    await flushPromises();
    await wrapper.find("button.content-move-drop").trigger("click");
    await vi.waitFor(() => expect(writes(fetch)).toHaveLength(1));
    expect(writes(fetch)[0]).toEqual([
      "/api/content/6/folder",
      { method: "PATCH", body: {} },
    ]);
  });

  it("picks a folder up from its row, and puts it down inside another, never inside itself", async () => {
    const { wrapper, fetch } = await mountContent(
      { folders: [{ ...ROMANS, parent: undefined }, NOTES] },
      { 2: {}, 3: {} },
    );
    // Folders are listed as the API orders them, by name: Romans first,
    // then the sermon notes.
    await act(wrapper, `${FOLDER}:nth-child(1)`, "Move");
    expect(wrapper.find(".content-move-text").text()).toBe(
      "Moving Romans. Open the folder it belongs in.",
    );
    const drop = wrapper.find("button.content-move-drop");
    expect(drop.attributes("disabled")).toBeDefined();

    // Inside itself is nowhere to put it.
    await enter(wrapper);
    expect(drop.attributes("disabled")).toBeDefined();
    await wrapper.find(".f-data-browser-breadcrumb button").trigger("click");
    await flushPromises();

    await wrapper
      .find(`${FOLDER}:nth-child(2) .f-data-browser-folder-btn`)
      .trigger("click");
    await flushPromises();
    expect(drop.attributes("disabled")).toBeUndefined();
    await drop.trigger("click");
    await vi.waitFor(() => expect(writes(fetch)).toHaveLength(1));
    expect(writes(fetch)[0]).toEqual([
      "/api/content/folders/3/parent",
      { method: "PATCH", body: { parent: 2 } },
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
    await enter(wrapper);
    fetch.mockRejectedValueOnce({ data: { message: "The folder is gone" } });
    await wrapper.find("button.content-move-drop").trigger("click");
    await vi.waitFor(() =>
      expect(wrapper.find(".content-error").exists()).toBe(true),
    );
    expect(wrapper.find(".content-error").text()).toBe("The folder is gone");
    expect(wrapper.find(".content-move").exists()).toBe(true);
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

  it("removes the documents and folders selected, once asked by their count, and lists the folder afresh with none selected", async () => {
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
      request?.method === undefined &&
      ["/api/content", "/api/content/folders"].includes(path)
        ? []
        : listing(path, request),
    );
    await press(wrapper, "Delete");
    await flushPromises();
    expect(confirm).toHaveBeenCalledWith(
      "Delete 3 items? This cannot be undone.",
    );
    expect(writes(fetch)).toEqual([
      ["/api/content/5", { method: "DELETE" }],
      ["/api/content/6", { method: "DELETE" }],
      ["/api/content/folders/2", { method: "DELETE" }],
    ]);
    expect(fetch).toHaveBeenLastCalledWith("/api/content", { query: {} });
    expect(wrapper.find(BAR).exists()).toBe(false);
    expect(wrapper.find(".content-error").exists()).toBe(false);
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
      if (path === "/api/content/folders/2") {
        throw { data: { message: "The folder is not empty" } };
      }
      // The document went; the folder that was refused is still listed.
      if (path === "/api/content" && request?.method === undefined) return [];
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
    fetch.mockImplementation(async (path, request) => {
      if (request?.method !== undefined) throw { status: 404 };
      return [];
    });
    await press(wrapper, "Delete");
    await flushPromises();
    expect(writes(fetch)).toEqual([["/api/content/5", { method: "DELETE" }]]);
    expect(wrapper.find(".content-error").exists()).toBe(false);
    expect(wrapper.find(BAR).exists()).toBe(false);
  });
});

describe("a page's page", () => {
  const mountPage = async (path = "/content/5/page") => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => HOME),
    );
    setRoutePath(path, { id: "5" });
    return mountSuspended(Content);
  };

  it("heads the page the address names, and hands it to the page under it", async () => {
    const { wrapper, error } = await mountPage();
    expect(error).toBeUndefined();
    const header = wrapper.findComponent(PageHeader);
    expect(header.props()).toMatchObject({
      title: "Butte Bible Fellowship",
      description: "A local church in Chico.",
      back: { label: "Content", to: "/content", icon: "chevron-left" },
    });
    expect(header.find("a.page-header-back").attributes("href")).toBe(
      "/content",
    );
    expect(header.findComponent(ContentMenu).props("record")).toEqual(HOME);
    expect(wrapper.findComponent(NuxtPage).props("record")).toEqual(HOME);
    expect(head()).toEqual({ title: "Butte Bible Fellowship" });
  });

  it("offers the page's own pages as tabs, the page itself the first and only one, lit when read", async () => {
    const { wrapper } = await mountPage();
    expect(wrapper.findComponent(PageHeader).props("tabs")).toEqual([
      { label: "Document", to: "/content/5/page" },
    ]);
    const tabs = wrapper.findAll(".page-header-tabs .f-tabs-trigger");
    expect(tabs.map((tab) => [tab.element.tagName, tab.text()])).toEqual([
      ["A", "Document"],
    ]);
    expect(tabs[0]?.attributes("href")).toBe("/content/5/page");
    expect(tabs[0]?.attributes("data-state")).toBe("active");
  });

  it("names the page afresh once the page under it saves it", async () => {
    const { wrapper } = await mountPage();
    wrapper.findComponent(NuxtPage).vm.$emit("saved", {
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

  it("describes the page by its description, or not at all", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ABOUT),
    );
    setRoutePath("/content/6/page", { id: "6" });
    const { wrapper } = await mountSuspended(Content);
    expect(wrapper.find(".page-header-title").text()).toBe("About Us");
    expect(wrapper.find(".page-header-description").exists()).toBe(false);
  });

  it("throws a 404 when no page has the id", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("404"), { status: 404 });
      }),
    );
    setRoutePath("/content/9/page", { id: "9" });
    const { wrapper, error } = await mountSuspended(Content);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Document not found",
    });
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("throws a 404 for an address that names no number", async () => {
    const fetch = vi.fn(async () => HOME);
    vi.stubGlobal("$fetch", fetch);
    setRoutePath("/content/x/page", { id: "x" });
    const { error } = await mountSuspended(Content);
    expect(error).toMatchObject({ statusCode: 404 });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("page page", () => {
  it("lays the page out in two panels: its metadata, then what is written on it", () => {
    const wrapper = mount(Page, { props: { record: HOME } });
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
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("lists the page's headings under its metadata, each linked to its own", async () => {
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
    const wrapper = mount(Page, { props: { record: { ...HOME, body } } });
    await wrapper.vm.$nextTick();
    const link = wrapper.find(
      ".content-page-side > .content-editor + nav.toc a.toc-link",
    );
    expect(link.text()).toBe("Our Vision");
    expect(link.attributes("href")).toBe("#our-vision");
    expect(wrapper.find(".content-body h2#our-vision").exists()).toBe(true);
  });

  it("lists nothing under the metadata of a page with no headings", async () => {
    const wrapper = mount(Page, { props: { record: HOME } });
    await wrapper.vm.$nextTick();
    expect(wrapper.find("nav.toc").exists()).toBe(false);
  });
  it("passes the record the form saved up to the page around it", () => {
    const wrapper = mount(Page, { props: { record: ABOUT } });
    const changed = { ...ABOUT, title: "Messages" };
    wrapper.findComponent(ContentEditor).vm.$emit("saved", changed);
    expect(wrapper.emitted("saved")).toEqual([[changed]]);
  });

  /** The page, drawn on the screen, with its bar's two buttons. */
  const mountWhole = () => {
    const wrapper = mount(Page, {
      props: { record: HOME },
      attachTo: document.body,
    });
    return {
      wrapper,
      save: wrapper.find("button.save-bar-save"),
      reset: wrapper.find("button.save-bar-reset"),
      content: () => wrapper.find(".content-body .f-data-editor-content"),
    };
  };

  /** Writes over the whole of what is written, as typing over a selection does. */
  const write = async (page: ReturnType<typeof mountWhole>, text: string) => {
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

  it("ends in one bar that saves the whole record, with nothing to do until something changes, and no button in either panel", () => {
    const { wrapper, save, reset } = mountWhole();
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

  it("saves the details and what is written at once, each where it is kept", async () => {
    const changed = { ...HOME, title: "Welcome" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const page = mountWhole();
    await page.wrapper.find("#content-title").setValue("Welcome");
    await write(page, "Since 2010.");
    expect(page.save.attributes("disabled")).toBeUndefined();
    await page.save.trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith("/api/content/5", {
      method: "PUT",
      body: expect.objectContaining({ title: "Welcome" }),
    });
    expect(fetch).toHaveBeenCalledWith("/api/content/5/body", {
      method: "PATCH",
      body: { body: expect.objectContaining({ type: "root" }) },
    });
    expect(page.wrapper.emitted("saved")).toEqual([[changed]]);
    expect(page.save.attributes("disabled")).toBeDefined();
    expect(page.reset.attributes("disabled")).toBeDefined();
  });

  it("saves only the panel that changed", async () => {
    const fetch = vi.fn(async () => HOME);
    vi.stubGlobal("$fetch", fetch);
    const page = mountWhole();
    await write(page, "Since 2010.");
    await page.save.trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "/api/content/5/body",
      expect.anything(),
    );
  });

  it("resets the details and what is written at once, to what was last saved", async () => {
    const fetch = vi.fn(async () => HOME);
    vi.stubGlobal("$fetch", fetch);
    const page = mountWhole();
    const field = page.wrapper.find("#content-title");
    await field.setValue("Welcome");
    await write(page, "A slip of the keys.");
    expect(page.reset.attributes("disabled")).toBeUndefined();
    await page.reset.trigger("click");
    await flushPromises();
    expect(fetch).not.toHaveBeenCalled();
    expect((field.element as HTMLInputElement).value).toBe(
      "Butte Bible Fellowship",
    );
    expect(page.content().text()).toBe("Has served since 2010.");
    expect(page.content().attributes("contenteditable")).toBeUndefined();
    expect(page.save.attributes("disabled")).toBeDefined();
    expect(page.reset.attributes("disabled")).toBeDefined();
  });

  it("says in the bar what went wrong with a save, and keeps what was written to try again", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const page = mountWhole();
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
