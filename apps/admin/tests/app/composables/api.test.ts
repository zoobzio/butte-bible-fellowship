import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearLoadingIndicator,
  setNuxtInstance,
  useLoadingIndicator,
} from "#imports";
import { useApi } from "~/composables/api";

const indicator = useLoadingIndicator();

describe("useApi", () => {
  beforeEach(() => {
    clearLoadingIndicator();
  });

  it("is the request's fetch, by path, with what the request carries", async () => {
    const fetch = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal("$fetch", fetch);
    const api = useApi();
    expect(await api("/api/staff", { method: "POST", body: { a: 1 } })).toEqual(
      { ok: true },
    );
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      method: "POST",
      body: { a: 1 },
    });
    await api("/api/staff/1");
    expect(fetch).toHaveBeenLastCalledWith("/api/staff/1", {});
  });

  it("carries a form as it is, for an upload", async () => {
    const fetch = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal("$fetch", fetch);
    const body = new FormData();
    body.append("file", new File(["x"], "x.png", { type: "image/png" }));
    await useApi()("/api/staff/1/avatar", { method: "PATCH", body });
    expect(fetch).toHaveBeenCalledWith("/api/staff/1/avatar", {
      method: "PATCH",
      body,
    });
  });

  it("runs the loading indicator across the call", async () => {
    let resolve!: (value: unknown) => void;
    const fetch = vi.fn(() => new Promise((r) => (resolve = r)));
    vi.stubGlobal("$fetch", fetch);
    const pending = useApi()("/api/staff");
    expect(indicator.start).toHaveBeenCalledTimes(1);
    expect(indicator.finish).not.toHaveBeenCalled();
    resolve({ ok: true });
    await pending;
    expect(indicator.finish).toHaveBeenCalledWith();
  });

  it("finishes the indicator in error when the call fails, and rethrows", async () => {
    const failure = new Error("nope");
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw failure;
      }),
    );
    await expect(useApi()("/api/staff")).rejects.toBe(failure);
    expect(indicator.start).toHaveBeenCalledTimes(1);
    expect(indicator.finish).toHaveBeenCalledWith({ error: true });
  });

  it("runs without the indicator where no Nuxt instance is reachable", async () => {
    const fetch = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal("$fetch", fetch);
    // The API is built at module scope, where there is no instance yet.
    setNuxtInstance(false);
    const api = useApi();
    expect(await api("/api/staff")).toEqual({ ok: true });
    expect(indicator.start).not.toHaveBeenCalled();
    expect(indicator.finish).not.toHaveBeenCalled();
    setNuxtInstance(true);
    await api("/api/staff");
    expect(indicator.start).toHaveBeenCalledTimes(1);
    expect(indicator.finish).toHaveBeenCalledTimes(1);
  });
});
