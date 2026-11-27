import { describe, expect, it, vi } from "vitest";

import { FAITH, GRACE } from "#test/support/records";
import { withSetup } from "@bbf/nuxt/testing/mount";
import { useSermonTasks } from "~/composables/sermons/tasks";
import { useSermonsTimeline } from "~/composables/sermons/timeline";

type Request = { method?: string; body?: object };

/**
 * The tasks over a timeline that holds the sermons given, with the admin's
 * API answering a sync as told.
 */
const mounted = async (
  answers: {
    sync?: () => unknown;
  } = {},
) => {
  const held = { items: [FAITH] };
  const fetch = vi.fn(async (path: string, _request: Request = {}) => {
    if (path === "/api/sermons/sync") return answers.sync?.();
    return { items: held.items, cursor: null, since: "7" };
  });
  vi.stubGlobal("$fetch", fetch);
  const { result } = withSetup(() => {
    const timeline = useSermonsTimeline();
    return { timeline, tasks: useSermonTasks(timeline) };
  });
  await result.timeline.init();
  fetch.mockClear();
  return { ...result, fetch, held };
};

describe("useSermonTasks", () => {
  it("syncs with YouTube, reads the sermons afresh, and says how many were added", async () => {
    const { tasks, timeline, fetch, held } = await mounted({
      sync: () => {
        held.items = [GRACE, FAITH];
        return { found: 15, added: 1 };
      },
    });
    const done = tasks.sync();
    expect(tasks.syncing.value).toBe(true);
    await done;
    expect(tasks.syncing.value).toBe(false);
    expect(fetch.mock.calls).toEqual([
      ["/api/sermons/sync", { method: "POST" }],
      ["/api/sermons", { query: { limit: 30 } }],
    ]);
    expect(timeline.records).toEqual([GRACE, FAITH]);
    expect(tasks.notice.value).toBe("1 sermon added.");
    expect(tasks.error.value).toBeNull();
  });

  it("counts more than one sermon added", async () => {
    const { tasks } = await mounted({
      sync: () => ({ found: 15, added: 3 }),
    });
    await tasks.sync();
    expect(tasks.notice.value).toBe("3 sermons added.");
  });

  it("says the sermons are up to date where none were added, and reads none again", async () => {
    const { tasks, fetch } = await mounted({
      sync: () => ({ found: 15, added: 0 }),
    });
    await tasks.sync();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(tasks.notice.value).toBe("Already up to date.");
  });

  it("syncs once at a time", async () => {
    const { tasks, fetch } = await mounted({
      sync: () => ({ found: 0, added: 0 }),
    });
    await Promise.all([tasks.sync(), tasks.sync()]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("reports a sync that fails as the API put it, and clears it on the next try", async () => {
    const sync = vi
      .fn()
      .mockRejectedValueOnce({ data: { message: "YouTube answered 404" } })
      .mockRejectedValueOnce(null)
      .mockResolvedValueOnce({ found: 0, added: 0 });
    const { tasks } = await mounted({ sync });
    await tasks.sync();
    expect(tasks.error.value).toBe("YouTube answered 404");
    expect(tasks.notice.value).toBeNull();
    expect(tasks.syncing.value).toBe(false);
    await tasks.sync();
    expect(tasks.error.value).toBe("Something went wrong.");
    await tasks.sync();
    expect(tasks.error.value).toBeNull();
    expect(tasks.notice.value).toBe("Already up to date.");
  });
});
