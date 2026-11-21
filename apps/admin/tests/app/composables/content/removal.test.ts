import { describe, expect, it, vi } from "vitest";

import { useRouter } from "#imports";
import { ABOUT } from "#test/support/records";
import { useContentRemoval } from "~/composables/content/removal";

describe("useContentRemoval", () => {
  it("deletes the page at its path, once asked by title, and leaves for the folder it was filed in", async () => {
    const fetch = vi.fn(async () => null);
    vi.stubGlobal("$fetch", fetch);
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    const removal = useContentRemoval(ABOUT, ["Sermon notes"]);
    const asked = removal.destroy();
    expect(removal.removing.value).toBe(true);
    await asked;
    expect(confirm).toHaveBeenCalledWith(
      "Delete About Us? This cannot be undone.",
    );
    expect(fetch).toHaveBeenCalledWith("/api/content/Sermon%20notes/about-us", {
      method: "DELETE",
    });
    expect(useRouter().push).toHaveBeenCalledWith("/content/Sermon%20notes");
    expect(removal.removing.value).toBe(false);
    expect(removal.error.value).toBeNull();
  });

  it("leaves a page at the top for the top", async () => {
    const fetch = vi.fn(async () => null);
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => true);
    await useContentRemoval(ABOUT, []).destroy();
    expect(fetch).toHaveBeenCalledWith("/api/content/about-us", {
      method: "DELETE",
    });
    expect(useRouter().push).toHaveBeenCalledWith("/content");
  });

  it("keeps the page when the question is declined", async () => {
    const fetch = vi.fn(async () => null);
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => false);
    await useContentRemoval(ABOUT, []).destroy();
    expect(fetch).not.toHaveBeenCalled();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("says what went wrong when the deletion fails, and stays, until the next try", async () => {
    const fetch = vi.fn(async (): Promise<unknown> => {
      throw new Error("The server is away.");
    });
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => true);
    const removal = useContentRemoval(ABOUT, []);
    await removal.destroy();
    expect(removal.error.value).toBe("The server is away.");
    expect(removal.removing.value).toBe(false);
    expect(useRouter().push).not.toHaveBeenCalled();

    fetch.mockResolvedValueOnce(null);
    await removal.destroy();
    expect(removal.error.value).toBeNull();
  });

  it("deletes once at a time", async () => {
    let answer = (_: unknown) => {};
    const fetch = vi.fn(
      () => new Promise<unknown>((resolve) => (answer = resolve)),
    );
    vi.stubGlobal("$fetch", fetch);
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    const removal = useContentRemoval(ABOUT, []);
    const first = removal.destroy();
    await removal.destroy();
    expect(confirm).toHaveBeenCalledTimes(1);
    answer(null);
    await first;
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
