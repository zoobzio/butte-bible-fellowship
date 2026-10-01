import { describe, expect, it } from "vitest";

import { useCookie } from "#imports";
import { useColorMode } from "~/composables/color-mode";

describe("useColorMode", () => {
  it("defaults to light", () => {
    expect(useColorMode().mode.value).toBe("light");
  });

  it("starts from the persisted cookie", () => {
    useCookie("color-mode").value = "dark";
    expect(useColorMode().mode.value).toBe("dark");
  });

  it("shares one mode across callers and persists changes", () => {
    const a = useColorMode();
    const b = useColorMode();
    a.set("dark");
    expect(b.mode.value).toBe("dark");
    expect(useCookie("color-mode").value).toBe("dark");
  });
});
