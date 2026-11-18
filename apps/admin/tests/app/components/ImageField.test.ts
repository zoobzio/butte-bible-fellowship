import type { Component } from "vue";

import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, shallowRef } from "vue";

import { ImageInput } from "#components";
import ImageField from "~/components/ImageField.vue";

const PHOTO = "https://cdn.example.com/events/worship.jpg";

const LABELS = {
  upload: "Upload picture",
  change: "Change picture",
  remove: "Remove picture",
  none: "No picture",
};

const image = () =>
  new File([new Uint8Array(8)], "worship.png", { type: "image/png" });

/**
 * The field as a form draws it: the control the form wires, holding what
 * the form's payload holds.
 */
const mountField = (
  held: File | string | undefined,
  props: Record<string, unknown> = {},
) => {
  const value = shallowRef(held);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(ImageField as Component, {
          control: {
            as: ImageInput,
            modelValue: value.value,
            accept: "image/jpeg,image/png,image/webp",
            pt: { input: { id: "event-image" } },
            "onUpdate:modelValue": (next: File | string | undefined) => {
              value.value = next;
            },
          },
          labels: LABELS,
          ...props,
        }),
    }),
  );
  return { wrapper, value };
};

describe("ImageField", () => {
  it("stands a mark in for no picture, named for a reader, and offers an upload", () => {
    const { wrapper } = mountField(undefined);
    expect(wrapper.find("img").exists()).toBe(false);
    const none = wrapper.find(".f-image-input-placeholder");
    expect(none.attributes("role")).toBe("img");
    expect(none.attributes("aria-label")).toBe("No picture");
    expect(none.find("use").attributes("href")).toBe("#image");
    expect(wrapper.find("label.image-field-pick").attributes("title")).toBe(
      "Upload picture",
    );
    expect(wrapper.find(".image-field-remove").exists()).toBe(false);
  });

  it("shows the picture held, with a change and a remove", () => {
    const { wrapper } = mountField(PHOTO);
    const picture = wrapper.find("img.f-image-input-preview");
    expect(picture.attributes("src")).toBe(PHOTO);
    expect(picture.attributes("alt")).toBe("");
    expect(wrapper.find(".f-image-input-placeholder").exists()).toBe(false);
    expect(wrapper.find("label.image-field-pick").attributes("title")).toBe(
      "Change picture",
    );
    const remove = wrapper.find("button.image-field-remove");
    expect(remove.attributes()).toMatchObject({
      type: "button",
      "aria-label": "Remove picture",
      title: "Remove picture",
    });
  });

  it("draws each control as a badge on the picture: an icon alone", () => {
    const { wrapper } = mountField(PHOTO);
    const badges = wrapper.findAll(".image-field-badge");
    expect(badges.map((badge) => badge.text())).toEqual(["", ""]);
    expect(badges.map((badge) => badge.find("use").attributes("href"))).toEqual(
      ["#camera", "#remove"],
    );
    expect(
      badges.map((badge) => badge.find("svg").attributes("aria-hidden")),
    ).toEqual(["true", "true"]);
    expect(wrapper.text()).toBe("");
  });

  it("picks one image of the kinds it is told, through the input the form wired, which its badge is a label of", () => {
    const { wrapper } = mountField(undefined);
    const input = wrapper.find("input");
    expect(input.attributes()).toMatchObject({
      id: "event-image",
      type: "file",
      accept: "image/jpeg,image/png,image/webp",
    });
    expect(input.attributes("multiple")).toBeUndefined();
    expect(wrapper.find("label.image-field-pick").attributes("for")).toBe(
      "event-image",
    );
  });

  it("hands the form the image picked, and none once it is removed", async () => {
    const { wrapper, value } = mountField(PHOTO);
    const file = image();
    wrapper.findComponent(ImageInput).vm.$emit("update:modelValue", file);
    expect(value.value).toBe(file);
    value.value = PHOTO;
    await wrapper.vm.$nextTick();
    await wrapper.find("button.image-field-remove").trigger("click");
    expect(value.value).toBeUndefined();
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("is a round frame for a portrait, with what stands in for none in it", () => {
    const { wrapper } = mountField(undefined, {
      round: true,
      fallback: "JD",
      labels: { ...LABELS, none: undefined },
    });
    expect(wrapper.find(".image-field").attributes("data-round")).toBe("true");
    const none = wrapper.find(".f-image-input-placeholder");
    expect(none.text()).toBe("JD");
    expect(none.attributes("role")).toBeUndefined();
    expect(none.find("svg").exists()).toBe(false);
    expect(
      mountField(PHOTO).wrapper.find(".image-field").attributes("data-round"),
    ).toBeUndefined();
  });
});
