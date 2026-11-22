import { describe, expect, it, vi } from "vitest";

import { useRouter } from "#imports";
import { PERSON } from "#test/support/records";
import { usePersonRemoval } from "~/composables/people/removal";

describe("usePersonRemoval", () => {
  it("deletes the person, once asked by name, and leaves for the list", async () => {
    const fetch = vi.fn(async () => null);
    vi.stubGlobal("$fetch", fetch);
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    const removal = usePersonRemoval(PERSON);
    const asked = removal.destroy();
    expect(removal.removing.value).toBe(true);
    await asked;
    expect(confirm).toHaveBeenCalledWith(
      "Delete Jane Doe? This cannot be undone.",
    );
    expect(fetch).toHaveBeenCalledWith("/api/people/1", { method: "DELETE" });
    expect(useRouter().push).toHaveBeenCalledWith("/people");
    expect(removal.removing.value).toBe(false);
    expect(removal.error.value).toBeNull();
  });

  it("keeps the person when the question is declined", async () => {
    const fetch = vi.fn(async () => null);
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => false);
    await usePersonRemoval(PERSON).destroy();
    expect(fetch).not.toHaveBeenCalled();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("says what went wrong when the deletion fails, and stays, until the next try", async () => {
    const fetch = vi.fn(async (): Promise<unknown> => {
      throw new Error("The server is away.");
    });
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => true);
    const removal = usePersonRemoval(PERSON);
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
    const removal = usePersonRemoval(PERSON);
    const first = removal.destroy();
    await removal.destroy();
    expect(confirm).toHaveBeenCalledTimes(1);
    answer(null);
    await first;
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
