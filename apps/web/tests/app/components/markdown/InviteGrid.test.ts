import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import InviteGrid from "~/components/markdown/InviteGrid.vue";

describe("InviteGrid", () => {
  it("lays what it is given out as a grid of invitations", () => {
    const grid = mount(InviteGrid, {
      slots: { default: "<div class='one' /><div class='two' />" },
    });
    expect(grid.element.tagName).toBe("SECTION");
    expect(grid.classes()).toContain("invite-grid");
    expect(grid.findAll(".invite-grid > div")).toHaveLength(2);
  });
});
