import { describe, expect, it } from "vitest";

import { useUntheme } from "#imports";
import { useColorMode } from "~/composables/theme";

describe("useColorMode", () => {
  it("defaults to the theme's boot selection, light", () => {
    expect(useColorMode().mode.value).toBe("light");
  });

  it("reads the color modifier the service holds", () => {
    useUntheme().swap("color", "dark");
    expect(useColorMode().mode.value).toBe("dark");
  });

  it("shares one mode across callers and writes it to the service", () => {
    const a = useColorMode();
    const b = useColorMode();
    a.set("dark");
    expect(b.mode.value).toBe("dark");
    expect(useUntheme().config.input.color).toBe("dark");
  });

  it("names the other mode", () => {
    const { other, set } = useColorMode();
    expect(other.value).toBe("dark");
    set("dark");
    expect(other.value).toBe("light");
  });

  it("toggles between modes", () => {
    const { mode, toggle } = useColorMode();
    toggle();
    expect(mode.value).toBe("dark");
    toggle();
    expect(mode.value).toBe("light");
  });
});
