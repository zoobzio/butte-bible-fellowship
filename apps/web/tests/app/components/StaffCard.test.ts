import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { useNuxtApp } from "#imports";

import type { StaffMember } from "@bbf/schema/types";

import StaffCard from "~/components/StaffCard.vue";

const mountCard = (member: StaffMember, compact?: boolean) =>
  mount(StaffCard, { props: { member, compact } });

describe("StaffCard", () => {
  it("names the person under their role, with their words and email", () => {
    const wrapper = mountCard({
      id: 1,
      name: "Jane Doe",
      role: "elder",
      summary: "Has served since 2010.",
      email: "jane@example.com",
    });
    expect(wrapper.find(".staff-card-frame + .staff-card-meta").exists()).toBe(
      true,
    );
    expect(wrapper.find(".staff-card-role").text()).toBe("Elder");
    expect(wrapper.find(".staff-card-role + h3").text()).toBe("Jane Doe");
    expect(wrapper.find("h3 + .staff-card-summary").text()).toBe(
      "Has served since 2010.",
    );
    const email = wrapper.find("a");
    expect(email.attributes("href")).toBe("mailto:jane@example.com");
    expect(email.text()).toBe("jane@example.com");
  });

  it("names the role as the messages do, never by its key", () => {
    const { $t } = useNuxtApp();
    const card = (role: "pastor" | "elder" | "staff") =>
      mountCard({ id: 1, name: "Jane Doe", role }).find(".staff-card-role");
    expect(card("pastor").text()).toBe($t.roles.pastor());
    expect(card("staff").text()).toBe($t.roles.staff());
    expect(card("elder").text()).not.toBe("elder");
  });

  it("shows the person's photo when they have one", () => {
    const wrapper = mountCard({
      id: 1,
      name: "Jane Doe",
      role: "elder",
      photo: "/images/jane.jpg",
    });
    const photo = wrapper.find(".staff-card-frame > img.staff-card-photo");
    expect(photo.attributes("src")).toBe("/images/jane.jpg");
    expect(photo.attributes("alt")).toBe("");
    expect(photo.attributes("loading")).toBe("lazy");
  });

  it("stands their initials in for a photo they do not have", () => {
    const initials = (name: string) =>
      mountCard({ id: 1, name, role: "elder" }).find(
        ".staff-card-frame > span.staff-card-initials",
      );
    expect(initials("Jane Doe").text()).toBe("JD");
    expect(initials("Jane Doe").attributes("aria-hidden")).toBe("true");
    expect(initials("Jane Ann Doe").text()).toBe("JD");
    expect(initials("  jane ").text()).toBe("J");
  });

  it("says only who the person is when it is compact", () => {
    const wrapper = mountCard(
      {
        id: 1,
        name: "Jane Doe",
        role: "elder",
        summary: "Has served since 2010.",
        email: "jane@example.com",
      },
      true,
    );
    expect(wrapper.find("article.staff-card.staff-card-compact").exists()).toBe(
      true,
    );
    expect(wrapper.find(".staff-card-initials").text()).toBe("JD");
    expect(wrapper.find(".staff-card-role + h3").text()).toBe("Jane Doe");
    expect(wrapper.find(".staff-card-summary").exists()).toBe(false);
    expect(wrapper.find("a").exists()).toBe(false);
  });

  it("is not compact unless it is asked to be", () => {
    const wrapper = mountCard({
      id: 1,
      name: "Jane Doe",
      role: "elder",
    });
    expect(wrapper.find(".staff-card-compact").exists()).toBe(false);
  });

  it("leaves out the words and email it was not given", () => {
    const wrapper = mountCard({
      id: 1,
      name: "Jane Doe",
      role: "elder",
    });
    expect(wrapper.find(".staff-card-summary").exists()).toBe(false);
    expect(wrapper.find("a").exists()).toBe(false);
  });
});
