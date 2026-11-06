import { describe, expect, it } from "vitest";

import { setRouteBack, setRoutePath, useRouter } from "#imports";
import { usePageBack } from "~/composables/navigation";

describe("usePageBack", () => {
  it("leads up to the page this one is under", () => {
    setRoutePath("/events/potluck");
    expect(usePageBack().up.value).toBe("/events");
    setRoutePath("/events");
    expect(usePageBack().up.value).toBe("/");
  });

  it("steps back to the page that brought the reader here", () => {
    setRoutePath("/events/potluck");
    setRouteBack("/");
    usePageBack().leave();
    expect(useRouter().back).toHaveBeenCalledOnce();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("goes up when no page of the site brought the reader here", () => {
    setRoutePath("/events/potluck");
    usePageBack().leave();
    expect(useRouter().push).toHaveBeenCalledExactlyOnceWith("/events");
    expect(useRouter().back).not.toHaveBeenCalled();
  });
});
