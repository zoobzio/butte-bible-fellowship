import { describe, expect, it } from "vitest";

import { useCookie } from "#imports";
import { useColorMode } from "~/composables/theme";

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

  it("names the other mode", () => {
    const { other, set } = useColorMode();
    expect(other.value).toBe("dark");
    set("dark");
    expect(other.value).toBe("light");
  });

  it("toggles between modes and persists the result", () => {
    const { mode, toggle } = useColorMode();
    toggle();
    expect(mode.value).toBe("dark");
    expect(useCookie("color-mode").value).toBe("dark");
    toggle();
    expect(mode.value).toBe("light");
    expect(useCookie("color-mode").value).toBe("light");
  });
});
