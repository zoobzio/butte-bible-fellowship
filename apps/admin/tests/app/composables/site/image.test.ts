import { describe, expect, it, vi } from "vitest";

import { HOME_PAGE } from "#test/support/records";
import { useHomeImage } from "~/composables/site/image";

const PHOTO = "https://store.public.blob.vercel-storage.com/home/1-abc.png";

const image = (type = "image/png", size = 8) =>
  new File([new Uint8Array(size)], "jane.png", { type });

describe("useHomeImage", () => {
  it("starts from the record's picture, or none", () => {
    const avatar = useHomeImage(HOME_PAGE);
    expect(avatar.picture.value).toBeUndefined();
    expect(avatar.busy.value).toBe(false);
    expect(useHomeImage({ ...HOME_PAGE, heroImage: PHOTO }).picture.value).toBe(
      PHOTO,
    );
  });

  it("offers the kinds of image the schema takes", () => {
    expect(useHomeImage(HOME_PAGE).accept).toBe(
      "image/jpeg,image/png,image/webp",
    );
  });

  it("uploads the image picked as a patch of its own, and shows the picture the server kept", async () => {
    const fetch = vi.fn(async (..._: unknown[]) => ({
      ...HOME_PAGE,
      heroImage: PHOTO,
    }));
    vi.stubGlobal("$fetch", fetch);
    const avatar = useHomeImage(HOME_PAGE);
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
    expect(path).toBe("/api/site/home/image");
    expect(request.method).toBe("PATCH");
    expect(request.body).toBeInstanceOf(FormData);
    expect(request.body.get("file")).toBe(file);
    expect(avatar.picture.value).toBe(PHOTO);
    expect(avatar.uploading.value).toBe(false);
    expect(avatar.files.value).toEqual([]);
    expect(avatar.error.value).toBeNull();
  });

  it("sends nothing the schema would refuse, and says why", async () => {
    const fetch = vi.fn(async () => HOME_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const avatar = useHomeImage(HOME_PAGE);
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
    const avatar = useHomeImage({ ...HOME_PAGE, heroImage: PHOTO });
    await avatar.pick([image()]);
    expect(avatar.error.value).toBe("The server is away.");
    expect(avatar.picture.value).toBe(PHOTO);
    expect(avatar.uploading.value).toBe(false);
    expect(avatar.files.value).toEqual([]);

    fetch.mockResolvedValueOnce({ ...HOME_PAGE, heroImage: PHOTO });
    await avatar.pick([image()]);
    expect(avatar.error.value).toBeNull();
  });

  it("removes the photo, once asked, saying what the site shows in its place", async () => {
    const fetch = vi.fn(async () => HOME_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    const avatar = useHomeImage({ ...HOME_PAGE, heroImage: PHOTO });
    await avatar.remove();
    expect(confirm).toHaveBeenCalledWith(
      "Remove the hero image? The site will show its own picture of the church.",
    );
    expect(fetch).toHaveBeenCalledWith("/api/site/home/image", {
      method: "DELETE",
    });
    expect(avatar.picture.value).toBeUndefined();
    expect(avatar.removing.value).toBe(false);
  });

  it("keeps the photo when the question is declined", async () => {
    const fetch = vi.fn(async () => HOME_PAGE);
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => false);
    const avatar = useHomeImage({ ...HOME_PAGE, heroImage: PHOTO });
    await avatar.remove();
    expect(fetch).not.toHaveBeenCalled();
    expect(avatar.picture.value).toBe(PHOTO);
  });

  it("does one thing at a time", async () => {
    const fetch = vi.fn(async () => ({ ...HOME_PAGE, heroImage: PHOTO }));
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => true);
    const avatar = useHomeImage({ ...HOME_PAGE, heroImage: PHOTO });
    const first = avatar.pick([image()]);
    await avatar.remove();
    await first;
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(avatar.picture.value).toBe(PHOTO);
  });
});
