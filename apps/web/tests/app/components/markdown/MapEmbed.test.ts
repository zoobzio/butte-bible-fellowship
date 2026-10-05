import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import MapEmbed from "~/components/markdown/MapEmbed.vue";

describe("MapEmbed", () => {
  it("renders a lazily loaded frame for the map, with its title", () => {
    const frame = mount(MapEmbed, {
      props: { src: "https://maps.example.com/embed", title: "Map to us" },
    });
    expect(frame.element.tagName).toBe("IFRAME");
    expect(frame.attributes("src")).toBe("https://maps.example.com/embed");
    expect(frame.attributes("title")).toBe("Map to us");
    expect(frame.attributes("loading")).toBe("lazy");
  });
});
