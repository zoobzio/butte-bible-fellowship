import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setAppConfig } from "#imports";
import AppFooter from "~/components/AppFooter.vue";

const mountFooter = () =>
  mount(AppFooter, { global: { stubs: { ColorMode: true } } });

beforeEach(() => {
  setAppConfig({
    site: { name: "Test Church", tagline: "On Test Road" },
    footer: {
      columns: [
        {
          title: "Visit",
          lines: [{ label: "1 Test Road" }, { label: "Testville" }],
        },
        {
          title: "Contact",
          lines: [
            { label: "555-0100", href: "tel:5550100" },
            {
              label: "Video",
              href: "https://example.com/video",
              target: "_blank",
            },
          ],
        },
      ],
    },
  });
});

describe("AppFooter", () => {
  it("renders a column per configured column, headed by its title", () => {
    const columns = mountFooter().findAll(".site-footer-col");
    expect(columns.map((column) => column.find("strong").text())).toEqual([
      "Visit",
      "Contact",
    ]);
  });

  it("renders lines without an href as plain text", () => {
    const [visit] = mountFooter().findAll(".site-footer-col");
    expect(visit!.findAll("p").map((line) => line.text())).toEqual([
      "Visit",
      "1 Test Road",
      "Testville",
    ]);
    expect(visit!.find("a").exists()).toBe(false);
  });

  it("renders lines with an href as links, passing the target through", () => {
    const [, contact] = mountFooter().findAll(".site-footer-col");
    expect(
      contact!.findAll("a").map((link) => ({
        label: link.text(),
        href: link.attributes("href"),
        target: link.attributes("target"),
      })),
    ).toEqual([
      { label: "555-0100", href: "tel:5550100", target: undefined },
      { label: "Video", href: "https://example.com/video", target: "_blank" },
    ]);
  });

  it("shows the color mode control and this year's copyright line", () => {
    const legal = mountFooter().find(".site-footer-legal");
    expect(legal.findComponent({ name: "ColorMode" }).exists()).toBe(true);
    expect(legal.find("span").text()).toBe(
      `© ${new Date().getFullYear()} Test Church`,
    );
  });
});
