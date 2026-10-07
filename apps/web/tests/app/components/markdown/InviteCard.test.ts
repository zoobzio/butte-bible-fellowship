import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import InviteCard from "~/components/markdown/InviteCard.vue";

describe("InviteCard", () => {
  it("holds an invitation's heading and words", () => {
    const card = mount(InviteCard, {
      slots: { default: "<h3>New to Chico?</h3><p>Join us.</p>" },
    });
    expect(card.classes()).toContain("invite-card");
    expect(card.find("h3").text()).toBe("New to Chico?");
    expect(card.find("p").text()).toBe("Join us.");
  });
});
