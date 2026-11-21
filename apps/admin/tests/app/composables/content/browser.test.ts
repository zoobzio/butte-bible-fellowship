import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

import { setRoutePath } from "#imports";
import { withSetup } from "@bbf/nuxt/testing/mount";
import { ABOUT, HOME, NOTES, ROMANS } from "#test/support/records";
import {
  useContentBrowser,
  useContentPath,
  useContentRequest,
  useFolderFetch,
} from "~/composables/content/browser";

/** The notes as the API answers with them: Romans inside, About Us filed. */
const FOLDER = {
  kind: "folder" as const,
  folder: NOTES,
  folders: [ROMANS],
  files: [ABOUT],
};

/** Nothing sorted, nothing searched for. */
const PLAIN = {
  sortField: null,
  sortDirection: "asc" as const,
  query: "",
  filters: [],
};

describe("useContentPath", () => {
  it("is the path the page's address names, and of no steps at the top", () => {
    setRoutePath("/content/Sermon%20notes/Romans", {
      path: ["Sermon notes", "Romans"],
    } as never);
    expect(withSetup(useContentPath).result).toEqual([
      "Sermon notes",
      "Romans",
    ]);
    setRoutePath("/content", { path: "" });
    expect(withSetup(useContentPath).result).toEqual([]);
    setRoutePath("/content");
    expect(withSetup(useContentPath).result).toEqual([]);
  });
});

describe("useFolderFetch", () => {
  it("asks for what a folder holds in one request of the folder's path, and lists it under that path", async () => {
    const fetch = vi.fn(async () => FOLDER);
    vi.stubGlobal("$fetch", fetch);
    const listing = await useFolderFetch()(
      { path: ["Sermon notes"], ...PLAIN, sortField: "size" },
      undefined as never,
    );
    expect(fetch.mock.calls).toEqual([
      [
        "/api/content/Sermon%20notes",
        { query: { sort: "size", direction: "asc" } },
      ],
    ]);
    expect(listing.files).toEqual([ABOUT]);
    expect(listing.folders).toMatchObject([
      { key: "Romans", link: { to: "/content/Sermon%20notes/Romans" } },
    ]);
  });

  it("lists nothing where the path has come to name a document", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ kind: "document", record: HOME })),
    );
    expect(
      await useFolderFetch()({ path: ["index"], ...PLAIN }, undefined as never),
    ).toEqual({ folders: [], files: [] });
  });
});

describe("useContentRequest", () => {
  /** The request of a path, made in setup as the page makes it. */
  const request = (path: string[]) =>
    withSetup(() => {
      const browser = useContentBrowser();
      return { browser, request: useContentRequest(browser, path) };
    }).result;

  it("asks the API at once, with nothing waited on first: the server keeps hold of the visitor's request no longer than that", () => {
    const fetch = vi.fn(async () => FOLDER);
    vi.stubGlobal("$fetch", fetch);
    request(["Sermon notes"]);
    // Before anything has been awaited: the trail is not asked for first.
    expect(fetch.mock.calls).toEqual([
      ["/api/content/Sermon%20notes", { query: {} }],
    ]);
  });

  it("stands the browser in the folder that comes back, on the trail its path spells, and hands the folder on", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => FOLDER),
    );
    const { browser, request: asked } = request(["Sermon notes"]);
    // The browser moves when the folder is there to list, and not before.
    expect(browser.pathKeys).toEqual([]);
    expect(browser.initialized).toBe(false);
    const { data } = await asked;
    expect(data.value).toEqual(FOLDER);
    expect(browser.initialized).toBe(true);
    expect(browser.path).toEqual([
      {
        key: "Sermon notes",
        label: "Sermon notes",
        link: { to: "/content/Sermon%20notes" },
      },
    ]);
    expect(browser.files).toEqual([ABOUT]);
    expect(browser.folders.map((folder) => folder.key)).toEqual(["Romans"]);
  });

  it("hands a document on and leaves the browser as it stands", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ kind: "document", record: HOME })),
    );
    const { browser, request: asked } = request(["index"]);
    const { data } = await asked;
    expect(data.value).toEqual({ kind: "document", record: HOME });
    expect(browser.pathKeys).toEqual([]);
    expect(browser.initialized).toBe(false);
  });

  it("is nothing where the path names nothing, and throws on whatever else fails", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("Not found"), { status: 404 });
      }),
    );
    const { data } = await request(["Gone"]).request;
    expect(data.value).toBeNull();

    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    await expect(request(["Gone"]).request).rejects.toThrow(
      "The server is away.",
    );
  });

  it("refuses an answer that is neither a folder nor a document", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => [HOME]),
    );
    await expect(request([]).request).rejects.toThrow();
    await flushPromises();
  });
});
