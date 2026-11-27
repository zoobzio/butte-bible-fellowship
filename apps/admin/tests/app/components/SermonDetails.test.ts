import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { FAITH, HOPE } from "#test/support/records";
import SermonDetails from "~/components/SermonDetails.vue";

const DETAILED = {
  ...FAITH,
  summary: "James 2, and what faith does.",
  image: "https://cdn.example.com/sermons/faith-and-works.jpg",
};

const value = (wrapper: ReturnType<typeof mount>, id: string) =>
  (wrapper.find(`#${id}`).element as HTMLInputElement).value;

describe("SermonDetails", () => {
  it("is one column of a sermon's details, every field of it but what is written about it", () => {
    const wrapper = mount(SermonDetails, { props: { record: DETAILED } });
    expect(
      wrapper.findAll(".f-data-form-field-label").map((label) => label.text()),
    ).toEqual([
      "Title",
      "Speaker",
      "Preached",
      "Summary",
      "Slug",
      "Status",
      "YouTube video",
      "Picture",
    ]);
  });

  it("opens on the sermon's record, every field filled", () => {
    const wrapper = mount(SermonDetails, { props: { record: DETAILED } });
    expect(value(wrapper, "sermon-title")).toBe("Faith & Works");
    expect(value(wrapper, "sermon-speaker")).toBe("Pastor Name");
    expect(value(wrapper, "sermon-date")).toBe("2026-10-04");
    expect(wrapper.find("#sermon-date").attributes("type")).toBe("date");
    expect(value(wrapper, "sermon-summary")).toBe(
      "James 2, and what faith does.",
    );
    expect(value(wrapper, "sermon-slug")).toBe("faith-and-works");
    expect(wrapper.find("#sermon-status").text()).toBe("Published");
    expect(value(wrapper, "sermon-video")).toBe("dQw4w9WgXcQ");
    expect(value(wrapper, "sermon-image")).toBe(
      "https://cdn.example.com/sermons/faith-and-works.jpg",
    );
  });

  it("leaves empty what the sermon has none of", () => {
    const wrapper = mount(SermonDetails, { props: { record: HOPE } });
    expect(value(wrapper, "sermon-speaker")).toBe("");
    expect(value(wrapper, "sermon-video")).toBe("");
    expect(wrapper.find("#sermon-status").text()).toBe("Archived");
  });

  it("is there to be read: every control is disabled, and nothing submits it", () => {
    const wrapper = mount(SermonDetails, { props: { record: DETAILED } });
    const controls = wrapper.findAll("input, textarea, button");
    expect(controls.length).toBeGreaterThanOrEqual(8);
    for (const control of controls) {
      expect(
        control.attributes("disabled") ?? control.attributes("data-disabled"),
        control.attributes("id"),
      ).toBeDefined();
    }
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false);
  });

  it("starts over from the record on each visit", () => {
    mount(SermonDetails, { props: { record: DETAILED } });
    const wrapper = mount(SermonDetails, { props: { record: HOPE } });
    expect(value(wrapper, "sermon-title")).toBe("Hope");
    expect(value(wrapper, "sermon-summary")).toBe("");
  });
});
