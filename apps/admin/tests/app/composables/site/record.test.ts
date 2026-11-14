import { describe, expect, it, vi } from "vitest";

import { ABOUT_PAGE, CONNECT_PAGE, HOME_PAGE } from "#test/support/records";
import {
  useAboutRecord,
  useConnectRecord,
  useHomeRecord,
} from "~/composables/site/record";

describe("useHomeRecord", () => {
  it("reads the home page from the admin's API, which has one", async () => {
    const fetch = vi.fn(async () => HOME_PAGE);
    vi.stubGlobal("$fetch", fetch);
    expect((await useHomeRecord()).data.value).toEqual(HOME_PAGE);
    expect(fetch).toHaveBeenCalledWith("/api/site/home", {});
  });

  it("reads nothing when the page's row is missing", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("404"), { status: 404 });
      }),
    );
    expect((await useHomeRecord()).data.value).toBeNull();
  });

  it("passes on what else goes wrong, and refuses what is not the page", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    await expect(useHomeRecord()).rejects.toThrow("The server is away.");
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ABOUT_PAGE),
    );
    await expect(useHomeRecord()).rejects.toThrow();
  });
});

describe("useAboutRecord", () => {
  it("reads About Us from the admin's API", async () => {
    const fetch = vi.fn(async () => ABOUT_PAGE);
    vi.stubGlobal("$fetch", fetch);
    expect((await useAboutRecord()).data.value).toEqual(ABOUT_PAGE);
    expect(fetch).toHaveBeenCalledWith("/api/site/about", {});
  });
});

describe("useConnectRecord", () => {
  it("reads the connect page from the admin's API, and refuses what is not it", async () => {
    const fetch = vi.fn(async () => CONNECT_PAGE);
    vi.stubGlobal("$fetch", fetch);
    expect((await useConnectRecord()).data.value).toEqual(CONNECT_PAGE);
    expect(fetch).toHaveBeenCalledWith("/api/site/connect", {});
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ABOUT_PAGE),
    );
    await expect(useConnectRecord()).rejects.toThrow();
  });
});
