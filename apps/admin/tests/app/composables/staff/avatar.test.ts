import { describe, expect, it, vi } from "vitest";

import { STAFF } from "#test/support/records";
import { useStaffAvatar } from "~/composables/staff/avatar";

const PHOTO = "https://store.public.blob.vercel-storage.com/staff/1-abc.png";

const image = (type = "image/png", size = 8) =>
  new File([new Uint8Array(size)], "jane.png", { type });

describe("useStaffAvatar", () => {
  it("starts from the record's photo, or none, with their initials to stand in", () => {
    const avatar = useStaffAvatar(STAFF);
    expect(avatar.photo.value).toBeUndefined();
    expect(avatar.fallback).toBe("JD");
    expect(avatar.busy.value).toBe(false);
    expect(useStaffAvatar({ ...STAFF, photo: PHOTO }).photo.value).toBe(PHOTO);
  });

  it("offers the kinds of image the schema takes", () => {
    expect(useStaffAvatar(STAFF).accept).toBe(
      "image/jpeg,image/png,image/webp",
    );
  });

  it("uploads the image picked as a patch of its own, and shows the photo the server kept", async () => {
    const fetch = vi.fn(async (..._: unknown[]) => ({
      ...STAFF,
      photo: PHOTO,
    }));
    vi.stubGlobal("$fetch", fetch);
    const avatar = useStaffAvatar(STAFF);
    const file = image();
    const picked = avatar.pick([file]);
    expect(avatar.uploading.value).toBe(true);
    expect(avatar.busy.value).toBe(true);
    expect(avatar.files.value).toEqual([file]);
    await picked;
    expect(fetch).toHaveBeenCalledTimes(1);
    const [path, request] = fetch.mock.calls[0] as [
      string,
      { method: string; body: FormData },
    ];
    expect(path).toBe("/api/staff/1/avatar");
    expect(request.method).toBe("PATCH");
    expect(request.body).toBeInstanceOf(FormData);
    expect(request.body.get("file")).toBe(file);
    expect(avatar.photo.value).toBe(PHOTO);
    expect(avatar.uploading.value).toBe(false);
    expect(avatar.files.value).toEqual([]);
    expect(avatar.error.value).toBeNull();
  });

  it("sends nothing the schema would refuse, and says why", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const avatar = useStaffAvatar(STAFF);
    await avatar.pick([image("application/pdf")]);
    await avatar.pick([image("image/png", 4 * 1024 * 1024 + 1)]);
    expect(fetch).not.toHaveBeenCalled();
    expect(avatar.error.value).toBe(
      "That file can’t be used. Choose a JPEG, PNG or WebP image of 4 MB or less.",
    );
    await avatar.pick([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("says what went wrong when the upload fails, keeps the photo, and clears it on the next try", async () => {
    const fetch = vi.fn(async (): Promise<unknown> => {
      throw new Error("The server is away.");
    });
    vi.stubGlobal("$fetch", fetch);
    const avatar = useStaffAvatar({ ...STAFF, photo: PHOTO });
    await avatar.pick([image()]);
    expect(avatar.error.value).toBe("The server is away.");
    expect(avatar.photo.value).toBe(PHOTO);
    expect(avatar.uploading.value).toBe(false);
    expect(avatar.files.value).toEqual([]);

    fetch.mockResolvedValueOnce({ ...STAFF, photo: PHOTO });
    await avatar.pick([image()]);
    expect(avatar.error.value).toBeNull();
  });

  it("removes the photo, once asked by name", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    const avatar = useStaffAvatar({ ...STAFF, photo: PHOTO });
    await avatar.remove();
    expect(confirm).toHaveBeenCalledWith("Remove Jane Doe’s photo?");
    expect(fetch).toHaveBeenCalledWith("/api/staff/1/avatar", {
      method: "DELETE",
    });
    expect(avatar.photo.value).toBeUndefined();
    expect(avatar.removing.value).toBe(false);
  });

  it("keeps the photo when the question is declined", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => false);
    const avatar = useStaffAvatar({ ...STAFF, photo: PHOTO });
    await avatar.remove();
    expect(fetch).not.toHaveBeenCalled();
    expect(avatar.photo.value).toBe(PHOTO);
  });

  it("does one thing at a time", async () => {
    const fetch = vi.fn(async () => ({ ...STAFF, photo: PHOTO }));
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => true);
    const avatar = useStaffAvatar({ ...STAFF, photo: PHOTO });
    const first = avatar.pick([image()]);
    await avatar.remove();
    await first;
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(avatar.photo.value).toBe(PHOTO);
  });
});
