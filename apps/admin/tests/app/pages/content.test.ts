import type { ContentRecord, FolderRecord } from "@bbf/schema/types";

import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { Browser, Dialog, Editor, NuxtPage } from "#components";
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

/**
 * The admin's API over the content: the top holds `top`, and each folder what
 * `inside` gives under its id. Every write answers with `answer`.
 */
const api = (top: Held, inside: Record<number, Held> = {}, answer?: unknown) =>
  vi.fn(async (path: string, request: Request = {}) => {
    if (request.method !== undefined) return answer;
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
) => {
  const fetch = api(top, inside, answer);
  vi.stubGlobal("$fetch", fetch);
  const { wrapper, error } = await mountSuspended(Index);
  expect(error).toBeUndefined();
  return { wrapper, fetch };
};

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
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith("/api/content/folders", { query: {} });
    expect(fetch).toHaveBeenCalledWith("/api/content", { query: {} });
    expect(browser.props("service").files).toEqual([HOME, ABOUT]);
    expect(browser.props("service").folders).toEqual([
      { key: "2", label: "Sermon notes", count: 1 },
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
        .findAll(`${POST}:first-child .f-td:not(.f-data-browser-actions)`)
        .map((cell) => cell.text()),
    ).toEqual([
      "Butte Bible Fellowship",
      "index",
      expect.stringContaining("2026"),
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

  it("says when a folder holds nothing", async () => {
    const { wrapper } = await mountContent({});
    expect(wrapper.find(".f-data-browser-empty").exists()).toBe(true);
    expect(wrapper.find(".f-data-browser table").exists()).toBe(false);
  });

  it("leads to a document's editor from its row's actions", async () => {
    const { wrapper } = await mountContent({ documents: [HOME] });
    await act(wrapper, POST, "Edit");
    const { navigateTo } = await import("#imports");
    expect(navigateTo).toHaveBeenCalledWith("/content/5/page");
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
    expect(
      wrapper.findAllComponents(Dialog).map((dialog) => dialog.props("open")),
    ).toEqual([false, false]);
    expect(wrapper.findComponent(ContentEditor).exists()).toBe(false);
    expect(wrapper.findComponent(FolderEditor).exists()).toBe(false);
    expect(document.body.querySelector(".f-dialog-content")).toBeNull();
  });

  it("opens the editor on no record, over the browser, named and described", async () => {
    const { wrapper } = await open();
    const dialog = wrapper.findAllComponents(Dialog)[0]!;
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
    expect(wrapper.findAllComponents(Dialog)[0]!.props("open")).toBe(false);
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
    const dialog = wrapper.findAllComponents(Dialog)[1]!;
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
    const dialog = wrapper.findAllComponents(Dialog)[1]!;
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
      { folders: [NOTES, { ...ROMANS, parent: undefined }] },
      { 2: {}, 3: {} },
    );
    // Folders are listed by name: Romans first, then the sermon notes.
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
