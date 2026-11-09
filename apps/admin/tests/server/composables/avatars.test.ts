import type { H3Event } from "h3";

import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import {
  EVENT_FOLDER,
  useBlobStore,
  useEventImage,
  useLocalStore,
  useStaffAvatar,
} from "~~/server/composables/avatars";

const BLOB = "https://store.public.blob.vercel-storage.com/staff";

const { put, del, kept } = vi.hoisted(() => ({
  put: vi.fn(async (pathname: string, _file: File, _options: object) => ({
    url: `https://store.public.blob.vercel-storage.com/${pathname.replace(".", "-abc.")}`,
  })),
  del: vi.fn(async (_url: string) => {}),
  kept: new Map<string, Uint8Array>(),
}));

vi.mock("@vercel/blob", () => ({ put, del }));

vi.mock("nitropack/runtime", () => ({
  useStorage: () => ({
    setItemRaw: async (key: string, value: Uint8Array) => {
      kept.set(key, value);
    },
    removeItem: async (key: string) => {
      kept.delete(key);
    },
  }),
}));

vi.mock("h3", async (original) => ({
  ...(await original<typeof import("h3")>()),
  getRequestURL: () => new URL("http://localhost:3001/api/staff/1/avatar"),
}));

const EVENT = {} as H3Event;

const image = (type = "image/png") =>
  new File([new Uint8Array([1, 2, 3])], "jane", { type });

const ROW = {
  id: 1,
  name: "Jane Doe",
  role: "elder" as const,
  summary: null,
  bio: null,
  photo: null as string | null,
  email: null,
  phone: null,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

/* One member, whose photo the queries read and write. */
const member = { ...ROW };
const fetched = vi.fn(async ({ id }: { id: number }) =>
  id === 1 ? { ...member } : null,
);
const portrayed = vi.fn(
  async ({ id, photo }: { id: number; photo: string | null }) => {
    if (id !== 1) return null;
    member.photo = photo;
    return { id, updated_at: ROW.updated_at };
  },
);

const EVENT_ROW = {
  id: 3,
  slug: "worship-service",
  title: "Worship Service",
  summary: null,
  body: null,
  image: null as string | null,
  date: "2026-01-04",
  recurring: true,
  weeks: null,
  start_time: "10:00:00",
  end_time: null,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

/* One event, whose picture the queries read and write. */
const worship = { ...EVENT_ROW };
const found = vi.fn(async ({ id }: { id: number }) =>
  id === 3 ? { ...worship } : null,
);
const pictured = vi.fn(
  async ({ id, image }: { id: number; image: string | null }) => {
    if (id !== 3) return null;
    worship.image = image;
    return { id, updated_at: EVENT_ROW.updated_at };
  },
);

Object.assign(service, {
  admin: {
    staff: { fetch: { first: fetched }, photo: { first: portrayed } },
    events: { fetch: { first: found }, image: { first: pictured } },
  },
});

afterEach(() => {
  member.photo = null;
  worship.image = null;
  found.mockClear();
  pictured.mockClear();
  kept.clear();
  for (const mock of [put, del, fetched, portrayed]) mock.mockClear();
  vi.restoreAllMocks();
});

describe("useBlobStore", () => {
  it("keeps a photo in Vercel Blob, public, under the member's id and a name of its own, as its kind", async () => {
    const file = image("image/webp");
    expect(await useBlobStore().put(7, file)).toBe(`${BLOB}/7-abc.webp`);
    expect(put).toHaveBeenCalledWith("staff/7.webp", file, {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/webp",
    });
    await useBlobStore().put(7, image("image/jpeg"));
    expect(put).toHaveBeenLastCalledWith(
      "staff/7.jpg",
      expect.any(File),
      expect.objectContaining({ contentType: "image/jpeg" }),
    );
  });

  it("keeps another kind of record's pictures in a folder of their own", async () => {
    const file = image("image/png");
    expect(await useBlobStore(EVENT_FOLDER).put(3, file)).toBe(
      "https://store.public.blob.vercel-storage.com/events/3-abc.png",
    );
    expect(put).toHaveBeenCalledWith(
      "events/3.png",
      file,
      expect.objectContaining({ access: "public", addRandomSuffix: true }),
    );
  });

  it("drops a photo it keeps, and leaves a URL that is another's alone", async () => {
    await useBlobStore().remove(`${BLOB}/7-abc.webp`);
    expect(del).toHaveBeenCalledWith(`${BLOB}/7-abc.webp`);
    del.mockClear();
    await useBlobStore().remove("https://cdn.example.com/staff/jane-doe.jpg");
    await useBlobStore().remove("/images/jane.jpg");
    expect(del).not.toHaveBeenCalled();
  });
});

describe("useLocalStore", () => {
  it("keeps a photo in the server's data, read back from this app under the origin asked", async () => {
    const url = await useLocalStore(EVENT).put(7, image());
    expect(url).toMatch(
      /^http:\/\/localhost:3001\/avatars\/7-[\da-f-]{36}\.png$/,
    );
    const name = url.slice("http://localhost:3001/avatars/".length);
    expect([...kept.keys()]).toEqual([`avatars:${name}`]);
    expect(kept.get(`avatars:${name}`)).toEqual(new Uint8Array([1, 2, 3]));
    expect(put).not.toHaveBeenCalled();
  });

  it("names another kind of record's picture by its folder first, read back the same way", async () => {
    const store = useLocalStore(EVENT, EVENT_FOLDER);
    const url = await store.put(3, image());
    expect(url).toMatch(
      /^http:\/\/localhost:3001\/avatars\/events-3-[\da-f-]{36}\.png$/,
    );
    expect(kept.size).toBe(1);
    await store.remove(url);
    expect(kept.size).toBe(0);
  });

  it("drops a photo it keeps, and leaves a URL that is another's alone", async () => {
    const store = useLocalStore(EVENT);
    const url = await store.put(7, image());
    await store.remove("https://cdn.example.com/avatars/7.png");
    expect(kept.size).toBe(1);
    await store.remove(url);
    expect(kept.size).toBe(0);
  });
});

describe("useStaffAvatar", () => {
  it("keeps the image, points the member at it, and hands back the record", async () => {
    const record = await useStaffAvatar(EVENT).replace(1, image());
    expect(put).toHaveBeenCalledTimes(1);
    expect(portrayed).toHaveBeenCalledWith({
      id: 1,
      photo: `${BLOB}/1-abc.png`,
    });
    expect(record).toMatchObject({ id: 1, photo: `${BLOB}/1-abc.png` });
    expect(del).not.toHaveBeenCalled();
  });

  it("drops the photo the member had, once they show the new one", async () => {
    member.photo = `${BLOB}/1-old.png`;
    await useStaffAvatar(EVENT).replace(1, image());
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(`${BLOB}/1-old.png`);
  });

  it("leaves a photo kept elsewhere where it is", async () => {
    member.photo = "https://cdn.example.com/staff/jane-doe.jpg";
    const record = await useStaffAvatar(EVENT).replace(1, image());
    expect(record?.photo).toBe(`${BLOB}/1-abc.png`);
    expect(del).not.toHaveBeenCalled();
  });

  it("keeps nothing for a member there is not", async () => {
    expect(await useStaffAvatar(EVENT).replace(9, image())).toBeNull();
    expect(put).not.toHaveBeenCalled();
  });

  it("drops the image again when the member is gone by the time it is kept", async () => {
    portrayed.mockResolvedValueOnce(null);
    expect(await useStaffAvatar(EVENT).replace(1, image())).toBeNull();
    expect(del).toHaveBeenCalledWith(`${BLOB}/1-abc.png`);
  });

  it("drops the image again when the member cannot be pointed at it, and says so", async () => {
    portrayed.mockRejectedValueOnce(new Error("The database is away."));
    await expect(useStaffAvatar(EVENT).replace(1, image())).rejects.toThrow(
      "The database is away.",
    );
    expect(del).toHaveBeenCalledWith(`${BLOB}/1-abc.png`);
  });

  it("saves the photo even when the last one cannot be dropped", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    member.photo = `${BLOB}/1-old.png`;
    del.mockRejectedValueOnce(new Error("The store is away."));
    const record = await useStaffAvatar(EVENT).replace(1, image());
    expect(record?.photo).toBe(`${BLOB}/1-abc.png`);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("clears a member's photo, and drops it from the store", async () => {
    member.photo = `${BLOB}/1-old.png`;
    const record = await useStaffAvatar(EVENT).clear(1);
    expect(portrayed).toHaveBeenCalledWith({ id: 1, photo: null });
    expect(record).toMatchObject({ id: 1 });
    expect(record?.photo).toBeUndefined();
    expect(del).toHaveBeenCalledWith(`${BLOB}/1-old.png`);
  });

  it("drops the photo of a member who is gone, a missing or a foreign one left be", async () => {
    const avatars = useStaffAvatar(EVENT);
    await avatars.discard(`${BLOB}/1-old.png`);
    expect(del).toHaveBeenCalledWith(`${BLOB}/1-old.png`);
    del.mockClear();
    await avatars.discard(undefined);
    await avatars.discard("https://cdn.example.com/staff/jane-doe.jpg");
    expect(del).not.toHaveBeenCalled();
  });

  it("clears nothing for a member there is not", async () => {
    expect(await useStaffAvatar(EVENT).clear(9)).toBeNull();
    expect(portrayed).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
  });
});

describe("useEventImage", () => {
  const EVENTS = "https://store.public.blob.vercel-storage.com/events";

  it("keeps the image with the events', points the event at it, and hands back the record", async () => {
    const record = await useEventImage(EVENT).replace(3, image());
    expect(put).toHaveBeenCalledWith(
      "events/3.png",
      expect.any(File),
      expect.any(Object),
    );
    expect(pictured).toHaveBeenCalledWith({
      id: 3,
      image: `${EVENTS}/3-abc.png`,
    });
    expect(record).toMatchObject({ id: 3, image: `${EVENTS}/3-abc.png` });
    expect(del).not.toHaveBeenCalled();
  });

  it("drops the picture the event had, once it shows the new one", async () => {
    worship.image = `${EVENTS}/3-old.png`;
    await useEventImage(EVENT).replace(3, image());
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(`${EVENTS}/3-old.png`);
  });

  it("keeps nothing for an event there is not", async () => {
    expect(await useEventImage(EVENT).replace(9, image())).toBeNull();
    expect(put).not.toHaveBeenCalled();
  });

  it("drops the image again when the event cannot be pointed at it, and says so", async () => {
    pictured.mockRejectedValueOnce(new Error("The database is away."));
    await expect(useEventImage(EVENT).replace(3, image())).rejects.toThrow(
      "The database is away.",
    );
    expect(del).toHaveBeenCalledWith(`${EVENTS}/3-abc.png`);
  });

  it("clears an event's picture, and drops it from the store", async () => {
    worship.image = `${EVENTS}/3-old.png`;
    const record = await useEventImage(EVENT).clear(3);
    expect(pictured).toHaveBeenCalledWith({ id: 3, image: null });
    expect(record).toMatchObject({ id: 3 });
    expect(record?.image).toBeUndefined();
    expect(del).toHaveBeenCalledWith(`${EVENTS}/3-old.png`);
  });

  it("clears nothing for an event there is not, and drops the picture of one that is gone", async () => {
    expect(await useEventImage(EVENT).clear(9)).toBeNull();
    expect(pictured).not.toHaveBeenCalled();
    await useEventImage(EVENT).discard(`${EVENTS}/3-old.png`);
    expect(del).toHaveBeenCalledWith(`${EVENTS}/3-old.png`);
  });
});
