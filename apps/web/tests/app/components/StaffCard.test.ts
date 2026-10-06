import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { StaffMember } from "#shared/types/staff";

import StaffCard from "~/components/StaffCard.vue";

const mountCard = (member: StaffMember, compact?: boolean) =>
  mount(StaffCard, { props: { member, compact } });

describe("StaffCard", () => {
  it("names the person under their role, with their words and email", () => {
    const wrapper = mountCard({
      name: "Jane Doe",
      role: "Elder",
      bio: "Has served since 2010.",
      email: "jane@example.com",
    });
    expect(wrapper.find(".staff-card-frame + .staff-card-meta").exists()).toBe(
      true,
    );
    expect(wrapper.find(".staff-card-role").text()).toBe("Elder");
    expect(wrapper.find(".staff-card-role + h3").text()).toBe("Jane Doe");
    expect(wrapper.find("h3 + .staff-card-bio").text()).toBe(
      "Has served since 2010.",
    );
    const email = wrapper.find("a");
    expect(email.attributes("href")).toBe("mailto:jane@example.com");
    expect(email.text()).toBe("jane@example.com");
  });

  it("shows the person's photo when they have one", () => {
    const wrapper = mountCard({
      name: "Jane Doe",
      role: "Elder",
      photo: "/images/jane.jpg",
    });
    const photo = wrapper.find(".staff-card-frame > img.staff-card-photo");
    expect(photo.attributes("src")).toBe("/images/jane.jpg");
    expect(photo.attributes("alt")).toBe("");
    expect(photo.attributes("loading")).toBe("lazy");
  });

  it("stands their initials in for a photo they do not have", () => {
    const initials = (name: string) =>
      mountCard({ name, role: "Elder" }).find(
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
        name: "Jane Doe",
        role: "Elder",
        bio: "Has served since 2010.",
        email: "jane@example.com",
      },
      true,
    );
    expect(wrapper.find("article.staff-card.staff-card-compact").exists()).toBe(
      true,
    );
    expect(wrapper.find(".staff-card-initials").text()).toBe("JD");
    expect(wrapper.find(".staff-card-role + h3").text()).toBe("Jane Doe");
    expect(wrapper.find(".staff-card-bio").exists()).toBe(false);
    expect(wrapper.find("a").exists()).toBe(false);
  });

  it("is not compact unless it is asked to be", () => {
    const wrapper = mountCard({ name: "Jane Doe", role: "Elder" });
    expect(wrapper.find(".staff-card-compact").exists()).toBe(false);
  });

  it("leaves out the words and email it was not given", () => {
    const wrapper = mountCard({ name: "Jane Doe", role: "Elder" });
    expect(wrapper.find(".staff-card-bio").exists()).toBe(false);
    expect(wrapper.find("a").exists()).toBe(false);
  });
});
