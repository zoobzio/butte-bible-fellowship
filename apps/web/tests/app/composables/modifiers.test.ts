import { afterEach, describe, expect, it, vi } from "vitest";

import { useUntheme } from "#imports";
import { useModifiers } from "~/composables/modifiers";

afterEach(() => {
  delete (document as { startViewTransition?: unknown }).startViewTransition;
});

describe("useModifiers", () => {
  it("lists every modifier but the theme, with its contexts", () => {
    const { settings } = useModifiers();
    expect(settings.map((setting) => setting.id)).toEqual([
      "color",
      "vibrancy",
      "contrast",
      "text",
      "density",
      "radius",
      "depth",
      "motion",
    ]);
    const density = settings.find((setting) => setting.id === "density")!;
    expect(density.name).toBe("Density");
    expect(density.contexts.map((context) => context.id)).toEqual([
      "compact",
      "default",
      "spacious",
    ]);
  });

  it("starts from the theme's boot selection", () => {
    const { selection } = useModifiers();
    expect(selection.value.color).toBe("light");
    expect(selection.value.density).toBe("default");
  });

  it("writes a chosen context to the service", () => {
    const { selection, set } = useModifiers();
    set("density", "spacious");
    expect(selection.value.density).toBe("spacious");
    expect(useUntheme().config.input.density).toBe("spacious");
  });

  it("shares one selection across callers", () => {
    useModifiers().set("contrast", "high");
    expect(useModifiers().selection.value.contrast).toBe("high");
  });

  it("cross-fades through a view transition where the browser has one", () => {
    const start = vi.fn((change: () => void) => change());
    Object.assign(document, { startViewTransition: start });
    useModifiers().set("radius", "sharp");
    expect(start).toHaveBeenCalledOnce();
    expect(useModifiers().selection.value.radius).toBe("sharp");
  });

  it("changes nothing when the context is already selected", () => {
    const start = vi.fn((change: () => void) => change());
    Object.assign(document, { startViewTransition: start });
    useModifiers().set("color", "light");
    expect(start).not.toHaveBeenCalled();
  });

  it("ignores a context the modifier does not have", () => {
    const { selection, set } = useModifiers();
    set("color", "sepia");
    expect(selection.value.color).toBe("light");
  });
});
