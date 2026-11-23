// @vitest-environment node
import type { H3Event } from "h3";

import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp, createRouter, defineEventHandler, toWebHandler } from "h3";

import { ABOUT, HOME, NOTES } from "#test/support/records";
import { useContentPaths } from "~~/server/composables/paths";

const tree = {
  locate: vi.fn(),
  read: vi.fn(),
  create: vi.fn(),
  move: vi.fn(),
  write: vi.fn(),
  remove: vi.fn(),
};
const content = { update: vi.fn() };
const folders = { update: vi.fn() };

vi.mock("~~/server/composables/tree", () => ({
  useContentTree: () => tree,
}));
vi.mock("~~/server/composables/content", () => ({
  useContent: () => content,
}));
vi.mock("~~/server/composables/folders", () => ({
  useFolders: () => folders,
}));

afterEach(() => {
  for (const service of [tree, content, folders]) {
    for (const method of Object.values(service)) method.mockReset();
  }
});

/**
 * The content's API as the admin routes it: every method at the top, which
 * nothing follows, and at whatever path follows it.
 */
const serve = () => {
  const run = (method: keyof ReturnType<typeof useContentPaths>) =>
    defineEventHandler((event: H3Event) => useContentPaths()[method](event));
  const router = createRouter();
  for (const route of ["/api/content", "/api/content/**:path"]) {
    router
      .get(route, run("read"))
      .post(route, run("create"))
      .put(route, run("update"))
      .patch(route, run("patch"))
      .delete(route, run("remove"));
  }
  /* What the last request that failed was told, as the admin shows it. */
  let told: string | undefined;
  const handle = toWebHandler(
    createApp({
      onError: (error) => {
        told = error.message;
      },
    }).use(router),
  );

  return async (method: string, address: string, body?: unknown) => {
    told = undefined;
    const response = await handle(
      new Request(`http://admin.test${address}`, {
        method,
        ...(body === undefined
          ? {}
          : {
              body: JSON.stringify(body),
              headers: { "content-type": "application/json" },
            }),
      }),
    );
    const text = await response.text();
    if (response.status >= 400) {
      return { status: response.status, body: { message: told } };
    }
    return {
      status: response.status,
      body: text === "" ? null : (JSON.parse(text) as unknown),
    };
  };
};

const FOLDER = { kind: "folder", folders: [NOTES], files: [HOME] };

describe("useContentPaths", () => {
  describe("the path of a request", () => {
    it("is of no steps at the top, where nothing follows the route", async () => {
      tree.read.mockResolvedValue(FOLDER);
      expect(await serve()("GET", "/api/content")).toEqual({
        status: 200,
        body: FOLDER,
      });
      expect(tree.read).toHaveBeenCalledWith([], {});
    });

    it("is the names that follow the route, each decoded as one step, whatever is in it", async () => {
      tree.read.mockResolvedValue(FOLDER);
      const request = serve();
      await request("GET", "/api/content/Sermon%20notes/Romans");
      expect(tree.read).toHaveBeenLastCalledWith(
        ["Sermon notes", "Romans"],
        {},
      );
      await request(
        "GET",
        "/api/content/Q%26A%3A%20one%2C%20two%20%2B%20three!/about-us",
      );
      expect(tree.read).toHaveBeenLastCalledWith(
        ["Q&A: one, two + three!", "about-us"],
        {},
      );
    });

    it("is a bad request where it could name nothing, and the content is not asked", async () => {
      const request = serve();
      for (const address of [
        "/api/content/a%2Fb",
        "/api/content/%E0%A4%A",
        "/api/content/a%5Cb",
        "/api/content/a%23b",
        "/api/content/50%25%20off",
      ]) {
        expect(await request("GET", address), address).toMatchObject({
          status: 400,
          body: { message: "Invalid path" },
        });
      }
      expect(tree.read).not.toHaveBeenCalled();
    });
  });

  describe("read", () => {
    it("answers with what the path names, searched and sorted as the query asks", async () => {
      tree.read.mockResolvedValue(FOLDER);
      const answer = await serve()(
        "GET",
        "/api/content/Sermon%20notes?q=romans&sort=size&direction=desc&titleContains=ro",
      );
      expect(answer.status).toBe(200);
      expect(tree.read).toHaveBeenCalledWith(["Sermon notes"], {
        q: "romans",
        sort: "size",
        direction: "desc",
        titleContains: "ro",
      });
    });

    it("is not found where the path names nothing, and a bad request for a query the schema refuses", async () => {
      tree.read.mockResolvedValue(null);
      const request = serve();
      expect(await request("GET", "/api/content/gone")).toMatchObject({
        status: 404,
        body: { message: "Folder or document not found" },
      });
      expect(
        (await request("GET", "/api/content?sort=description")).status,
      ).toBe(400);
    });
  });

  describe("create", () => {
    it("makes a document or a folder in the folder the path names, and answers with it as created", async () => {
      const request = serve();
      tree.create.mockResolvedValue(ABOUT);
      expect(
        await request("POST", "/api/content/Sermon%20notes", {
          kind: "document",
          slug: "about-us",
          title: "About Us",
        }),
      ).toEqual({ status: 201, body: ABOUT });
      expect(tree.create).toHaveBeenLastCalledWith(["Sermon notes"], {
        kind: "document",
        slug: "about-us",
        title: "About Us",
      });

      tree.create.mockResolvedValue(NOTES);
      expect(
        await request("POST", "/api/content", {
          kind: "folder",
          name: " Sermon notes ",
        }),
      ).toEqual({ status: 201, body: NOTES });
      expect(tree.create).toHaveBeenLastCalledWith([], {
        kind: "folder",
        name: "Sermon notes",
      });
    });

    it("refuses what is neither, or a name that is no step of a path, before the content is asked", async () => {
      const request = serve();
      for (const body of [
        { slug: "about-us", title: "About Us" },
        { kind: "folder", name: "a/b" },
        { kind: "folder", name: "why?" },
        { kind: "folder", name: ".." },
        { kind: "document", slug: "About Us", title: "About Us" },
      ]) {
        expect((await request("POST", "/api/content", body)).status).toBe(400);
      }
      expect(tree.create).not.toHaveBeenCalled();
    });

    it("says what the content refused it over", async () => {
      const request = serve();
      const entry = { kind: "folder", name: "Romans" };
      const refusals = [
        ["missing", 404, "Folder not found"],
        ["taken", 409, "That name is already in use"],
        ["gone", 409, "The folder no longer exists"],
        [null, 500, "Could not save"],
      ] as const;
      for (const [refusal, status, message] of refusals) {
        tree.create.mockResolvedValue(refusal);
        expect(
          await request("POST", "/api/content/Sermon%20notes", entry),
          String(refusal),
        ).toMatchObject({ status, body: { message } });
      }
    });
  });

  describe("update", () => {
    it("renames the folder the path names", async () => {
      tree.locate.mockResolvedValue({ kind: "folder", id: 2 });
      folders.update.mockResolvedValue({ ...NOTES, name: "Notes" });
      expect(
        await serve()("PUT", "/api/content/Sermon%20notes", { name: "Notes" }),
      ).toEqual({ status: 200, body: { ...NOTES, name: "Notes" } });
      expect(tree.locate).toHaveBeenCalledWith(["Sermon notes"]);
      expect(folders.update).toHaveBeenCalledWith(2, { name: "Notes" });
      expect(content.update).not.toHaveBeenCalled();
    });

    it("replaces the metadata of the document the path names", async () => {
      tree.locate.mockResolvedValue({ kind: "document", id: 6 });
      content.update.mockResolvedValue(ABOUT);
      const body = { slug: "about-us", title: "About Us" };
      expect(
        await serve()("PUT", "/api/content/Sermon%20notes/about-us", body),
      ).toEqual({ status: 200, body: ABOUT });
      expect(content.update).toHaveBeenCalledWith(6, body);
      expect(folders.update).not.toHaveBeenCalled();
    });

    it("checks what is written against what the path names: a folder takes no metadata, a document no bare name", async () => {
      const request = serve();
      tree.locate.mockResolvedValue({ kind: "folder", id: 2 });
      expect(
        (await request("PUT", "/api/content/Sermon%20notes", { name: "a/b" }))
          .status,
      ).toBe(400);
      tree.locate.mockResolvedValue({ kind: "document", id: 6 });
      expect(
        (await request("PUT", "/api/content/about-us", { name: "Notes" }))
          .status,
      ).toBe(400);
      expect(folders.update).not.toHaveBeenCalled();
      expect(content.update).not.toHaveBeenCalled();
    });

    it("is not found where the path names nothing, the top included, or what it named is gone, and a conflict for a name taken", async () => {
      const request = serve();
      tree.locate.mockResolvedValue(null);
      expect(
        (await request("PUT", "/api/content/gone", { name: "Notes" })).status,
      ).toBe(404);
      tree.locate.mockResolvedValue({ kind: "folder" });
      expect(
        (await request("PUT", "/api/content", { name: "Notes" })).status,
      ).toBe(404);

      tree.locate.mockResolvedValue({ kind: "folder", id: 2 });
      for (const [refusal, status] of [
        [null, 404],
        ["gone", 404],
        ["taken", 409],
      ] as const) {
        folders.update.mockResolvedValue(refusal);
        expect(
          (await request("PUT", "/api/content/Sermon%20notes", { name: "N" }))
            .status,
          String(refusal),
        ).toBe(status);
      }
    });
  });

  describe("patch", () => {
    it("moves what the path names into the folder another path names, or to the top", async () => {
      const request = serve();
      tree.move.mockResolvedValue(ABOUT);
      expect(
        await request("PATCH", "/api/content/about-us", {
          parent: ["Sermon notes"],
        }),
      ).toEqual({ status: 200, body: ABOUT });
      expect(tree.move).toHaveBeenLastCalledWith(
        ["about-us"],
        ["Sermon notes"],
      );
      await request("PATCH", "/api/content/Sermon%20notes/about-us", {
        parent: [],
      });
      expect(tree.move).toHaveBeenLastCalledWith(
        ["Sermon notes", "about-us"],
        [],
      );
      expect(tree.write).not.toHaveBeenCalled();
    });

    it("writes what is written on the document the path names, or nothing once it is left out", async () => {
      const request = serve();
      tree.write.mockResolvedValue(HOME);
      expect(
        await request("PATCH", "/api/content/index", { body: HOME.body }),
      ).toEqual({ status: 200, body: HOME });
      expect(tree.write).toHaveBeenLastCalledWith(["index"], {
        body: HOME.body,
      });
      await request("PATCH", "/api/content/index", {});
      expect(tree.write).toHaveBeenLastCalledWith(["index"], {});
      expect(tree.move).not.toHaveBeenCalled();
    });

    it("refuses a part that is neither, so nothing is cleared by a slip", async () => {
      const request = serve();
      for (const body of [
        { folder: 2 },
        { parent: "Sermon notes" },
        { parent: ["a/b"] },
        { body: HOME.body, title: "Welcome" },
      ]) {
        expect(
          (await request("PATCH", "/api/content/index", body)).status,
          JSON.stringify(body),
        ).toBe(400);
      }
      expect(tree.write).not.toHaveBeenCalled();
      expect(tree.move).not.toHaveBeenCalled();
    });

    it("says what the content refused a move, or a writing, over", async () => {
      const request = serve();
      const moves = [
        ["missing", 404, "Folder or document not found"],
        ["taken", 409, "That name is already in use in the destination folder"],
        ["gone", 409, "The folder no longer exists"],
        [
          "refused",
          409,
          "A folder cannot be moved into itself or a folder inside it",
        ],
      ] as const;
      for (const [refusal, status, message] of moves) {
        tree.move.mockResolvedValue(refusal);
        expect(
          await request("PATCH", "/api/content/Romans", { parent: [] }),
          refusal,
        ).toMatchObject({ status, body: { message } });
      }
      tree.write.mockResolvedValue("refused");
      expect(
        await request("PATCH", "/api/content/Sermon%20notes", {}),
      ).toMatchObject({
        status: 409,
        body: { message: "Nothing is written on a folder" },
      });
      tree.write.mockResolvedValue("missing");
      expect((await request("PATCH", "/api/content/gone", {})).status).toBe(
        404,
      );
    });
  });

  describe("remove", () => {
    it("removes what the path names, and answers with nothing", async () => {
      tree.remove.mockResolvedValue(true);
      expect(
        await serve()("DELETE", "/api/content/Sermon%20notes/about-us"),
      ).toEqual({ status: 204, body: null });
      expect(tree.remove).toHaveBeenCalledWith(["Sermon notes", "about-us"]);
    });

    it("is not found where the path names nothing, and a conflict for a folder that holds something", async () => {
      const request = serve();
      tree.remove.mockResolvedValue("missing");
      expect(await request("DELETE", "/api/content/gone")).toMatchObject({
        status: 404,
        body: { message: "Folder or document not found" },
      });
      tree.remove.mockResolvedValue("refused");
      expect(
        await request("DELETE", "/api/content/Sermon%20notes"),
      ).toMatchObject({
        status: 409,
        body: { message: "The folder is not empty" },
      });
    });
  });
});
