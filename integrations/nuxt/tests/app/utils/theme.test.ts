import type { AppUnthemePatch } from "#imports";

import { describe, expect, it } from "vitest";

import { overlay } from "#layers/bbf/app/utils/theme";

const RED = { colorSpace: "srgb", components: [1, 0, 0], hex: "#ff0000" };
const BLUE = { colorSpace: "srgb", components: [0, 0, 1], hex: "#0000ff" };

const patch = (value: object) => value as AppUnthemePatch;

describe("overlay", () => {
  it("is the patch under it when nothing is laid over", () => {
    const under = patch({ id: "bbf", name: "Ours", tokens: { primary: RED } });
    expect(overlay(under, {})).toEqual(under);
    expect(overlay({}, {})).toEqual({});
  });

  it("binds a token as the patch over it does, and keeps the rest", () => {
    expect(
      overlay(
        patch({ tokens: { "primary-500": RED, "primary-600": RED } }),
        patch({ tokens: { "primary-600": BLUE, "primary-700": BLUE } }),
      ),
    ).toEqual({
      tokens: {
        "primary-500": RED,
        "primary-600": BLUE,
        "primary-700": BLUE,
      },
    });
  });

  it("binds a context's tokens the same way, context for context", () => {
    expect(
      overlay(
        patch({
          modifiers: {
            color: { dark: { primary: "{primary-300}", surface: RED } },
            text: { lg: { "body-size": "{title-size}" } },
          },
        }),
        patch({
          modifiers: {
            color: {
              dark: { primary: "{primary-200}" },
              light: { primary: "{primary-700}" },
            },
          },
        }),
      ),
    ).toEqual({
      modifiers: {
        color: {
          dark: { primary: "{primary-200}", surface: RED },
          light: { primary: "{primary-700}" },
        },
        text: { lg: { "body-size": "{title-size}" } },
      },
    });
  });

  it("keeps the identity and the order of the patch under it", () => {
    const over = { id: "theirs", name: "Theirs", tokens: { primary: BLUE } };
    expect(
      overlay(patch({ id: "bbf", name: "Ours", order: ["color"] }), over),
    ).toEqual({
      id: "bbf",
      name: "Ours",
      order: ["color"],
      tokens: { primary: BLUE },
    });
    expect(overlay({}, over)).toEqual({ tokens: { primary: BLUE } });
  });

  it("changes neither patch", () => {
    const under = patch({ tokens: { primary: RED } });
    const over = patch({ tokens: { primary: BLUE } });
    overlay(under, over);
    expect(under).toEqual({ tokens: { primary: RED } });
    expect(over).toEqual({ tokens: { primary: BLUE } });
  });
});
